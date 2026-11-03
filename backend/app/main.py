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

# Allow Vercel deployments, localhost, and custom frontend domains
origins = list(set(settings.FRONTEND_ORIGINS + [
    "https://learnmate-lac.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "LearnMate API is running"}

@app.get("/health")
def root_health():
    return {"status": "ok", "service": "LearnMate API"}

app.include_router(health.router)
app.include_router(flashcards.router)
app.include_router(records.router)
app.include_router(rag.router)
app.include_router(tutor.router)
app.include_router(quiz.router)
