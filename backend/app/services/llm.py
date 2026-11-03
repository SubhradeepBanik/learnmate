"""Text generation with OpenRouter, Groq, or Gemini as fallback."""

import httpx
from google.genai import types

from app.config import settings
from app.services.gemini_client import call_with_retry, get_client


class LlmError(Exception):
    pass


def _generate_with_openrouter(
    prompt: str,
    system_instruction: str | None = None,
    temperature: float = 0.2,
) -> str:
    if not settings.OPENROUTER_API_KEY:
        raise LlmError("OPENROUTER_API_KEY is missing. Add it to backend/.env and restart.")

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "LearnMate",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": settings.MAX_OUTPUT_TOKENS,
    }

    try:
        with httpx.Client(timeout=45.0) as client:
            resp = client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if resp.status_code != 200:
                err_detail = "OpenRouter API error"
                try:
                    err_json = resp.json()
                    err_detail = err_json.get("error", {}).get("message", resp.text)
                except Exception:
                    err_detail = resp.text
                raise LlmError(f"OpenRouter API error ({resp.status_code}): {err_detail}")

            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.RequestError as exc:
        raise LlmError(f"Network error connecting to OpenRouter: {exc}")


def _generate_with_groq(
    prompt: str,
    system_instruction: str | None = None,
    temperature: float = 0.2,
) -> str:
    if not settings.GROQ_API_KEY:
        raise LlmError("GROQ_API_KEY is missing. Add it to backend/.env and restart.")

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": settings.MAX_OUTPUT_TOKENS,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if resp.status_code != 200:
                err_detail = "Groq API error"
                try:
                    err_json = resp.json()
                    err_detail = err_json.get("error", {}).get("message", resp.text)
                except Exception:
                    err_detail = resp.text
                raise LlmError(f"Groq API error ({resp.status_code}): {err_detail}")

            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.RequestError as exc:
        raise LlmError(f"Network error connecting to Groq: {exc}")


def _generate_with_gemini(
    prompt: str,
    system_instruction: str | None = None,
    temperature: float = 0.3,
) -> str:
    client = get_client()

    config_kwargs = {
        "system_instruction": system_instruction,
        "temperature": temperature,
    }
    if hasattr(settings, "GEMINI_THINKING_BUDGET") and settings.GEMINI_THINKING_BUDGET is not None:
        try:
            config_kwargs["thinking_config"] = types.ThinkingConfig(
                thinking_budget=settings.GEMINI_THINKING_BUDGET
            )
        except Exception:
            pass

    def run():
        try:
            return client.models.generate_content(
                model=settings.GEMINI_CHAT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(**config_kwargs),
            )
        except Exception:
            if "thinking_config" in config_kwargs:
                config_kwargs.pop("thinking_config", None)
                return client.models.generate_content(
                    model=settings.GEMINI_CHAT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )
            raise

    response = call_with_retry(run)
    return (response.text or "").strip()


def generate_text(
    prompt: str,
    system_instruction: str | None = None,
    temperature: float = 0.2,
) -> str:
    """Generate text using OpenRouter first, then Groq, then Gemini."""
    if settings.OPENROUTER_API_KEY:
        return _generate_with_openrouter(prompt, system_instruction, temperature)
    if settings.GROQ_API_KEY:
        return _generate_with_groq(prompt, system_instruction, temperature)
    return _generate_with_gemini(prompt, system_instruction, temperature)
