"""Trait scoring for Part 2 of the Stellar DNA profile."""

TRAIT_AXES = [
    "creativity",
    "resilience",
    "curiosity",
    "discipline",
    "empathy",
    "ambition",
]


def compute_sky_diversity(spectral_weights: dict[str, float]) -> int:
    """Count OBAFGKM classes that hold more than 5% of the visible sky.

    Used by the curiosity-type rule table in Part 2 (see
    docs/PART2_REFERENCE.md §Score 4) and exposed via the Part 1 API
    response so both stages share one source of truth.
    """
    return sum(1 for w in spectral_weights.values() if w > 0.05)


def score_traits(part1: dict | None, chrono: dict) -> dict[str, float]:
    """Combine elemental breakdown + chrono info into 0-1 trait scores.

    Stub: returns a deterministic placeholder for each axis. Replace with
    weighted combinations of element yields and seasonal modifiers.
    """
    elements = (part1 or {}).get("elements", [])
    top_element = elements[0]["element"] if elements else "Fe"
    base = hash((top_element, chrono.get("season"), chrono.get("hemisphere"))) % 100 / 100.0
    return {axis: round(base + (i * 0.07) % 1.0, 3) for i, axis in enumerate(TRAIT_AXES)}
