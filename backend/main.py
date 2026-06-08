"""Stellar DNA FastAPI application entry point."""

import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import part1, part2

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

if not os.getenv("GEMINI_API_KEY") and not os.getenv("GROQ_API_KEY"):
    logger.warning(
        "No LLM API keys found (GEMINI_API_KEY or GROQ_API_KEY). "
        "Trait scores will still compute, but narrative paragraphs "
        "will be empty. Copy backend/.env.example to backend/.env "
        "and add at least one key."
    )

app = FastAPI(
    title="Stellar DNA API",
    version="0.1.0",
    description="Compute elemental stellar profiles from birth data.",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175")
allowed_origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(part1.router, prefix="/api", tags=["part1"])
app.include_router(part2.router, prefix="/api", tags=["part2"])


@app.get("/")
def root():
    return {"service": "stellar-dna", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
