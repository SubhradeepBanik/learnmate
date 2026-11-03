"""HTTP endpoints for the friendly AI Tutor chatbot."""

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import llm, tutor_service

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class TutorChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1)
    doc_id: str | None = None
    lang: Literal["en", "as", "auto"] = "en"


@router.post("/chat")
def chat(body: TutorChatRequest):
    try:
        dict_messages = [m.model_dump() for m in body.messages]
        result = tutor_service.chat_with_tutor(
            messages=dict_messages,
            doc_id=body.doc_id,
            lang=body.lang,
        )
        return result
    except llm.LlmError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
