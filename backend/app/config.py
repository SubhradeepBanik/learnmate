"""Central place for reading private environment settings."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    FRONTEND_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS",
            "http://localhost:5173",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
