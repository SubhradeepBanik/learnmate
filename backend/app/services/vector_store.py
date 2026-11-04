"""ChromaDB wrapper. All vector database code lives here.

Uses in-memory ChromaDB so the RAG feature works on ephemeral hosts like
Render's free tier (no persistent disk). Documents are stored for the
lifetime of the process only — uploaded PDFs are re-indexed on each session.
"""

import chromadb

_client = chromadb.EphemeralClient()
_collection = _client.get_or_create_collection(
    name="study_materials",
    embedding_function=None,            # we supply our own Gemini vectors
    metadata={"hnsw:space": "cosine"},  # lower distance = more similar
)


def add_chunks(ids, documents, embeddings, metadatas) -> None:
    _collection.add(
        ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas
    )


def query(embedding: list[float], top_k: int, doc_id: str | None = None) -> list[dict]:
    result = _collection.query(
        query_embeddings=[embedding],
        n_results=top_k,
        where={"doc_id": doc_id} if doc_id else None,
        include=["documents", "metadatas", "distances"],
    )
    hits = []
    if result and result["documents"] and len(result["documents"]) > 0:
        for text, meta, distance in zip(
            result["documents"][0], result["metadatas"][0], result["distances"][0]
        ):
            hits.append({**meta, "text": text, "distance": distance})
    return hits


def get_document_chunks(doc_id: str | None = None, limit: int = 20) -> list[dict]:
    """Retrieve representative chunks from a document to generate quizzes or summaries."""
    where_clause = {"doc_id": doc_id} if doc_id else None
    data = _collection.get(where=where_clause, limit=limit, include=["documents", "metadatas"])
    chunks = []
    if data and data.get("documents"):
        for text, meta in zip(data["documents"], data["metadatas"]):
            chunks.append({**meta, "text": text})
    return chunks


def document_exists(doc_id: str) -> bool:
    found = _collection.get(where={"doc_id": doc_id}, limit=1)
    return len(found["ids"]) > 0


def list_documents() -> list[dict]:
    data = _collection.get(include=["metadatas"])
    docs: dict[str, dict] = {}
    for meta in data["metadatas"]:
        doc = docs.setdefault(
            meta["doc_id"],
            {
                "doc_id": meta["doc_id"],
                "filename": meta["filename"],
                "subject": meta["subject"],
                "topic": meta["topic"],
                "pages": meta["total_pages"],
                "chunks": 0,
            },
        )
        doc["chunks"] += 1
    return list(docs.values())


def delete_document(doc_id: str) -> None:
    _collection.delete(where={"doc_id": doc_id})
