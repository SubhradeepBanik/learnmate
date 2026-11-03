"""One shared Gemini client plus a retry helper for rate limits."""

import time
from functools import lru_cache

from google import genai
from google.genai import errors

from app.config import settings


class GeminiNotConfigured(RuntimeError):
    pass


@lru_cache
def get_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise GeminiNotConfigured(
            "GEMINI_API_KEY is missing. Add it to backend/.env and restart the server."
        )
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def call_with_retry(fn, max_retries: int = 5):
    """Run fn(); if Gemini says 'too many requests' or is busy, wait and retry."""
    for attempt in range(max_retries):
        try:
            return fn()
        except errors.APIError as exc:
            retryable = exc.code in (429, 500, 503)
            if not retryable or attempt == max_retries - 1:
                raise
            time.sleep(2 ** (attempt + 1))  # 2s, 4s, 8s, 16s