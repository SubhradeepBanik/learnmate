"""HTTP endpoints for the RAG feature."""

from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field

from app.config import settings
from app.services import llm, rag_service, vector_store
from app.services.gemini_client import GeminiNotConfigured

router = APIRouter(prefix="/api/rag", tags=["rag"])


def _to_http_error(exc: Exception) -> HTTPException:
    """Convert internal errors into clear messages for the frontend."""
    if isinstance(exc, rag_service.RagError):
        return HTTPException(status_code=exc.status_code, detail=exc.message)
    if isinstance(exc, llm.LlmError):
        return HTTPException(status_code=502, detail=str(exc))
    if isinstance(exc, GeminiNotConfigured):
        return HTTPException(status_code=503, detail=str(exc))
    if isinstance(exc, genai_errors.APIError):
        if exc.code == 429:
            return HTTPException(
                status_code=429,
                detail="Gemini rate limit reached. Wait a minute and try again.",
            )
        return HTTPException(status_code=502, detail=f"Gemini API error ({exc.code}): {exc.message}")
    raise exc


class AskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    lang: Literal["en", "as", "auto"] = "auto"
    doc_id: str | None = None
    top_k: int = Field(default=settings.TOP_K, ge=1, le=10)


# Plain `def` (not async): FastAPI runs these in a worker thread, so slow
# PDF/Gemini work does not freeze the server.
@router.post("/documents")
def upload_document(
    file: UploadFile = File(...),
    subject: str = Form(""),
    topic: str = Form(""),
):
    filename = file.filename or "document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    data = file.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File is larger than {settings.MAX_UPLOAD_MB} MB.")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="This file is not a valid PDF.")

    try:
        return rag_service.ingest_pdf(data, filename, subject.strip(), topic.strip())
    except Exception as exc:
        raise _to_http_error(exc)


@router.get("/documents")
def list_documents():
    return vector_store.list_documents()


@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    try:
        rag_service.remove_document(doc_id)
    except Exception as exc:
        raise _to_http_error(exc)
    return {"deleted": doc_id}


@router.post("/ask")
def ask(body: AskRequest):
    try:
        return rag_service.ask(body.question.strip(), body.lang, body.doc_id, body.top_k)
    except Exception as exc:
        raise _to_http_error(exc)
