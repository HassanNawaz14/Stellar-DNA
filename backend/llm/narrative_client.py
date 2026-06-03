"""LLM client: routes between Gemini and Groq based on availability."""

import os

import httpx


def _call_gemini(prompt: str) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={api_key}"
    )
    try:
        with httpx.Client(timeout=30) as client:
            r = client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            r.raise_for_status()
            return r.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return None


def _call_groq(prompt: str) -> str | None:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    url = "https://api.groq.com/openai/v1/chat/completions"
    try:
        with httpx.Client(timeout=30) as client:
            r = client.post(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    except Exception:
        return None


def generate_narrative(prompt: str) -> str:
    """Try Gemini, then Groq, then return a stub if both are unavailable."""
    return (
        _call_gemini(prompt)
        or _call_groq(prompt)
        or "Narrative generation is offline. Set GEMINI_API_KEY or GROQ_API_KEY in .env."
    )
