"""Turn text into vectors using Gemini's multilingual embedding model."""

from google.genai import types

from app.config import settings
from app.services.gemini_client import call_with_retry, get_client

BATCH_SIZE = 50


def _embed_batch(batch: list[str], task_type: str) -> list[list[float]]:
    client = get_client()

    def run():
        result = client.models.embed_content(
            model=settings.GEMINI_EMBED_MODEL,
            contents=batch,
            config=types.EmbedContentConfig(
                task_type=task_type,
                output_dimensionality=settings.EMBED_DIMENSIONS,
            ),
        )
        return [e.values for e in result.embeddings]

    return call_with_retry(run)


def embed_texts(texts: list[str], task_type: str) -> list[list[float]]:
    """task_type: 'RETRIEVAL_DOCUMENT' for stored chunks, 'RETRIEVAL_QUERY' for questions."""
    vectors: list[list[float]] = []
    for i in range(0, len(texts), BATCH_SIZE):
        vectors.extend(_embed_batch(texts[i : i + BATCH_SIZE], task_type))
    return vectors