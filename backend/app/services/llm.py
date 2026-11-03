"""Generic text generation with Gemini."""

from google.genai import types

from app.config import settings
from app.services.gemini_client import call_with_retry, get_client


def generate_text(
    prompt: str,
    system_instruction: str | None = None,
    temperature: float = 0.3,
) -> str:
    client = get_client()

    def run():
        return client.models.generate_content(
            model=settings.GEMINI_CHAT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=temperature,
            ),
        )

    response = call_with_retry(run)
    return (response.text or "").strip()