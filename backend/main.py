"""Stellar DNA FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import part1, part2

app = FastAPI(
    title="Stellar DNA API",
    version="0.1.0",
    description="Compute elemental stellar profiles from birth data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
