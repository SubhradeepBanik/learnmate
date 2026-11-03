"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_database
from app.routers import health, flashcards, records, quiz, rag, tutor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the local app database and seed initial data.
    init_database()
    yield


app = FastAPI(title="LearnMate API", version="0.3.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(flashcards.router)
app.include_router(records.router)
app.include_router(rag.router)
app.include_router(tutor.router)
app.include_router(quiz.router)
