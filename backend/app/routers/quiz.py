"""HTTP endpoints for Quiz Studio."""

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import llm, quiz_service

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


class QuizGenerateRequest(BaseModel):
    doc_id: str | None = None
    num_questions: int = Field(default=5, ge=1, le=10)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    lang: Literal["en", "as"] = "en"


@router.post("/generate")
def generate_quiz_endpoint(body: QuizGenerateRequest):
    try:
        questions = quiz_service.generate_quiz(
            doc_id=body.doc_id,
            num_questions=body.num_questions,
            difficulty=body.difficulty,
            lang=body.lang,
        )
        return {"questions": questions}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except llm.LlmError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
