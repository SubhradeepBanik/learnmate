"""One shared Gemini client plus a retry helper for rate limits."""

import time

from google import genai
from google.genai import errors

from app.config import settings


class GeminiNotConfigured(RuntimeError):
    pass


def get_client() -> genai.Client:
    """Return a Gemini client using the current API key from settings.

    No lru_cache — so the latest key from .env is always used after a restart.
    """
    if not settings.GEMINI_API_KEY:
        raise GeminiNotConfigured(
            "GEMINI_API_KEY is missing. Add it to backend/.env and restart the server."
        )
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def call_with_retry(fn, max_retries: int = 3):
    """Run fn(); if Gemini says 'too many requests' or is busy, wait and retry.
    If daily quota is exhausted (RESOURCE_EXHAUSTED), immediately raise so fallback model can take over.
    """
    for attempt in range(max_retries):
        try:
            return fn()
        except errors.APIError as exc:
            err_str = str(exc).lower()
            # If daily limit/quota was hit, waiting 2 seconds won't help; fail immediately to trigger model fallback
            if "per day limit exceeded" in err_str or "quota exceeded" in err_str or "resource_exhausted" in err_str:
                raise

            retryable = exc.code in (429, 500, 503)
            if not retryable or attempt == max_retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
