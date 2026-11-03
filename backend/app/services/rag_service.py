"""The RAG pipeline: ingest a PDF, then answer questions from it."""

import uuid

from app.config import settings
from app.services import vector_store
from app.services.chunking import chunk_page
from app.services.embeddings import embed_texts
from app.services.llm import generate_text
from app.services.pdf_service import extract_pages


class RagError(Exception):
    """A problem we can explain to the user."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


SYSTEM_PROMPT = """You are LearnMate, a patient and accurate university tutor.
Rules:
1. Answer ONLY using the numbered context passages provided. Never use outside knowledge for facts.
2. If the passages do not contain the answer, say clearly that the study material does not cover it. Do not guess.
3. After each claim, cite the passage number in square brackets, like [1] or [2][3].
4. The question and the passages may be in different languages (English or Assamese). Translate ideas as needed.
5. Explain clearly and simply, like a good teacher. Use short paragraphs or numbered steps."""

LANGUAGE_RULES = {
    "en": "Write your entire answer in English.",
    "as": (
        "Write your entire answer in Assamese (অসমীয়া) using Assamese script, "
        "with the correct letters ৰ and ৱ. Keep technical terms in English inside "
        "brackets after the Assamese term when that helps understanding."
    ),
    "auto": "Write your answer in the same language as the student's question.",
}


def ingest_pdf(pdf_bytes: bytes, filename: str, subject: str, topic: str) -> dict:
    doc_id = uuid.uuid4().hex[:12]
    pdf_path = settings.UPLOAD_DIR / f"{doc_id}.pdf"
    pdf_path.write_bytes(pdf_bytes)

    try:
        try:
            total_pages, pages = extract_pages(pdf_path)
        except ValueError:
            raise RagError("This PDF is password-protected. Remove the password and retry.")
        except Exception:
            raise RagError("Could not read this PDF. The file may be damaged.")

        if not pages:
            raise RagError(
                "No selectable text found. This looks like a scanned PDF; "
                "scanned documents (OCR) are not supported yet."
            )

        ids, texts, metadatas = [], [], []
        for page in pages:
            chunks = chunk_page(page["text"], settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
            for index, chunk in enumerate(chunks):
                ids.append(f"{doc_id}_p{page['page']}_c{index}")
                texts.append(chunk)
                metadatas.append(
                    {
                        "doc_id": doc_id,
                        "filename": filename,
                        "subject": subject,
                        "topic": topic,
                        "page": page["page"],
                        "total_pages": total_pages,
                    }
                )

        if not texts:
            raise RagError("The PDF has too little text to process.")
        if len(texts) > settings.MAX_CHUNKS_PER_DOC:
            raise RagError(
                f"This PDF is too large ({len(texts)} chunks). Split it into smaller files."
            )

        vectors = embed_texts(texts, "RETRIEVAL_DOCUMENT")
        vector_store.add_chunks(ids, texts, vectors, metadatas)
    except Exception:
        pdf_path.unlink(missing_ok=True)  # don't keep half-processed files
        raise

    return {
        "doc_id": doc_id,
        "filename": filename,
        "subject": subject,
        "topic": topic,
        "pages": total_pages,
        "chunks": len(texts),
        # Lets you eyeball whether Assamese text was extracted correctly
        "preview": pages[0]["text"][:300],
    }


def remove_document(doc_id: str) -> None:
    if not vector_store.document_exists(doc_id):
        raise RagError("Document not found.", 404)
    vector_store.delete_document(doc_id)
    (settings.UPLOAD_DIR / f"{doc_id}.pdf").unlink(missing_ok=True)


def ask(question: str, lang: str, doc_id: str | None, top_k: int) -> dict:
    if doc_id and not vector_store.document_exists(doc_id):
        raise RagError("Document not found.", 404)

    question_vector = embed_texts([question], "RETRIEVAL_QUERY")[0]
    hits = vector_store.query(question_vector, top_k, doc_id)
    if not hits:
        raise RagError("No study materials found. Upload a PDF first.")

    context = "\n\n".join(
        f"[{n}] (source: {hit['filename']}, page {hit['page']})\n{hit['text']}"
        for n, hit in enumerate(hits, start=1)
    )
    prompt = (
        f"CONTEXT PASSAGES:\n{context}\n\n"
        f"STUDENT QUESTION:\n{question}\n\n"
        f"{LANGUAGE_RULES[lang]}"
    )
    answer = generate_text(prompt, system_instruction=SYSTEM_PROMPT, temperature=0.2)

    sources = [
        {
            "n": n,
            "doc_id": hit["doc_id"],
            "filename": hit["filename"],
            "page": hit["page"],
            "snippet": hit["text"][:220],
            "distance": round(hit["distance"], 3),
        }
        for n, hit in enumerate(hits, start=1)
    ]
    return {"answer": answer, "sources": sources, "lang": lang}