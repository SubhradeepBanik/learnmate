"""ChromaDB wrapper. All vector database code lives here."""

import chromadb

from app.config import settings

_client = chromadb.PersistentClient(path=str(settings.CHROMA_DIR))
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
    for text, meta, distance in zip(
        result["documents"][0], result["metadatas"][0], result["distances"][0]
    ):
        hits.append({**meta, "text": text, "distance": distance})
    return hits


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