"""Trait scoring for Part 2 of the Stellar DNA profile."""

TRAIT_AXES = [
    "creativity",
    "resilience",
    "curiosity",
    "discipline",
    "empathy",
    "ambition",
]


def score_traits(part1: dict | None, chrono: dict) -> dict[str, float]:
    """Combine elemental breakdown + chrono info into 0-1 trait scores.

    Stub: returns a deterministic placeholder for each axis. Replace with
    weighted combinations of element yields and seasonal modifiers.
    """
    elements = (part1 or {}).get("elements", [])
    top_element = elements[0]["element"] if elements else "Fe"
    base = hash((top_element, chrono.get("season"), chrono.get("hemisphere"))) % 100 / 100.0
    return {axis: round(base + (i * 0.07) % 1.0, 3) for i, axis in enumerate(TRAIT_AXES)}
