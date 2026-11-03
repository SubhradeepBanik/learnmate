"""Health-check and language test endpoints."""

from typing import Literal

from fastapi import APIRouter, Query

from app.config import settings

router = APIRouter(prefix="/api", tags=["health"])

GREETINGS = {
    "en": {
        "title": "Welcome to LearnMate",
        "subtitle": "Learn in the language you think in.",
    },
    "as": {
        "title": "লাৰ্নমেটলৈ আপোনাক স্বাগতম",
        "subtitle": "আপুনি যি ভাষাত ভাবে, সেই ভাষাতে শিকক।",
    },
}


@router.get("/health")
def health_check():
    """Tells the frontend the server is alive (never returns the key itself)."""
    return {
        "status": "ok",
        "service": "LearnMate API",
        "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY),
        "gemini_key_configured": bool(settings.GEMINI_API_KEY),
    }


@router.get("/greeting")
def greeting(lang: Literal["en", "as"] = Query("en")):
    """Returns a greeting in English or Assamese to test Unicode end to end."""
    return {"lang": lang, **GREETINGS[lang]}
