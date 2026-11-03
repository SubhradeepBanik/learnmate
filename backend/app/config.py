"""Central place for reading configuration from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent  # the backend/ folder
load_dotenv(BASE_DIR / ".env")


class Settings:
    # --- OpenRouter (flexible multi-model LLM generation) ---
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")

    # --- Groq (alternative ultra-fast LLM generation) ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # --- Common LLM limits ---
    MAX_OUTPUT_TOKENS: int = int(os.getenv("MAX_OUTPUT_TOKENS", "2048"))

    # --- Gemini (multilingual embeddings & fallback) ---
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_CHAT_MODEL: str = os.getenv("GEMINI_CHAT_MODEL", "gemini-3.8-flash")
    GEMINI_THINKING_BUDGET: int = int(os.getenv("GEMINI_THINKING_BUDGET", "0"))
    GEMINI_EMBED_MODEL: str = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")
    EMBED_DIMENSIONS: int = 768

    # --- CORS ---
    FRONTEND_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]

    # --- Storage ---
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    CHROMA_DIR: Path = BASE_DIR / "chroma_db"

    # --- RAG tuning ---
    MAX_UPLOAD_MB: int = 20
    MAX_CHUNKS_PER_DOC: int = 1500
    CHUNK_SIZE: int = 1000      # characters
    CHUNK_OVERLAP: int = 150    # characters
    TOP_K: int = 5


settings = Settings()
settings.UPLOAD_DIR.mkdir(exist_ok=True)
settings.CHROMA_DIR.mkdir(exist_ok=True)
