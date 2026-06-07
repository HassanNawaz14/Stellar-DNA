"""Aggregate spectral classes for Part 1.

Takes the visible stars produced by the sky engine, counts how many fall into
each OBAFGKM class, normalizes into a probability distribution, and identifies
both the dominant class and the brightest example star in that class.
"""

PRIMARY_CLASSES = ["O", "B", "A", "F", "G", "K", "M"]


def classify_stars(sky: dict) -> dict:
    """Compute spectral_weights, dominant_class, and dominant_star_example.

    Input sky dict must contain a ``star_positions`` list (as produced by
    ``core.sky_engine.compute_sky``). Each star must have ``spectral_class`` and
    ``magnitude`` keys.
    """
    counts = {c: 0 for c in PRIMARY_CLASSES}
    for star in sky.get("star_positions", []):
        c = star.get("spectral_class", "G")
        if c in counts:
            counts[c] += 1

    total = sum(counts.values()) or 1
    weights = {c: round(counts[c] / total, 4) for c in PRIMARY_CLASSES}
    dominant = max(weights, key=weights.get)

    brightest = None
    for star in sky.get("star_positions", []):
        if star.get("spectral_class") != dominant:
            continue
        if brightest is None or star["magnitude"] < brightest["magnitude"]:
            brightest = star

    example = brightest["name"] if brightest else "—"

    return {
        "spectral_weights": weights,
        "dominant_class": dominant,
        "dominant_star_example": example,
    }
