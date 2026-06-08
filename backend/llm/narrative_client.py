"""LLM client: routes between Gemini and Groq based on availability.

Both calls are async httpx. Gemini is tried first; if it fails (no key,
network error, API error), Groq is used as fallback. Returns a dict
with ``archetype_name``, ``paragraph_1/2/3``.
"""

import json
import logging
import os
import re

import httpx

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> dict | None:
    """Try multiple strategies to extract a JSON dict from LLM output.

    1. Direct ``json.loads`` on the whole text
    2. Extract from markdown code blocks (```json … ```)
    3. Find the first ``{…}`` block via regex
    """
    if not text:
        return None

    # Strategy 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: markdown code blocks (with or without json label)
    for pattern in (r"```(?:json)\s*\n(.*?)```", r"```\n?(.*?)```"):
        m = re.search(pattern, text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1).strip())
            except json.JSONDecodeError:
                pass

    # Strategy 3: any {…} block (greedy, outermost)
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass

    return None


GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
]


async def _call_gemini(prompt: str) -> dict | None:
    """Call Google Gemini, trying models in priority order. Returns parsed JSON or None."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.85,
            "maxOutputTokens": 500,
        },
    }

    for model in GEMINI_MODELS:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        try:
            async with httpx.AsyncClient() as client:
                r = await client.post(url, json=body, timeout=30)
                r.raise_for_status()
                raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                result = _extract_json(raw)
                if result is not None:
                    return result
                logger.warning("Gemini %s returned unparseable: %s", model, raw[:200])
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in (429, 503):
                logger.warning("Gemini %s busy (%s), trying next model", model, exc.response.status_code)
                continue
            logger.warning("Gemini %s error: %s", model, exc)
        except Exception as exc:
            logger.warning("Gemini %s error: %s", model, exc)

    return None


async def _call_groq(prompt: str) -> dict | None:
    """Call Groq Llama 3 8B. Returns parsed JSON or None."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.85,
        "max_tokens": 500,
        "response_format": {"type": "json_object"},
    }
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, headers=headers, json=body, timeout=30)
            r.raise_for_status()
            raw = r.json()["choices"][0]["message"]["content"]
            result = _extract_json(raw)
            if result is None:
                logger.warning("Groq returned unparseable text: %s", raw[:300])
            return result
    except Exception as exc:
        logger.warning("Groq API call failed: %s", exc)
        return None


async def generate_narrative(prompt: str) -> dict:
    """Try Gemini first, fall back to Groq, then return empty dict."""
    narrative = await _call_gemini(prompt)
    if narrative:
        return narrative
    narrative = await _call_groq(prompt)
    if narrative:
        return narrative
    logger.warning("Both Gemini and Groq failed — returning empty narrative")
    return {}
