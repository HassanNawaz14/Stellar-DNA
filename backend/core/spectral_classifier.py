"""Aggregate spectral classes for Part 1.

Takes the visible stars produced by the sky engine, computes a brightness-
weighted spectral distribution (each star weighted by its apparent flux
10^(-mag/2.5)), normalizes into a probability distribution, and identifies
both the dominant class and the brightest example star in that class.

Brightness weighting makes results vary meaningfully by time and location —
a few bright stars dominate the visual sky, and which bright stars are up
changes throughout the night and across latitudes.
"""

import math

PRIMARY_CLASSES = ["O", "B", "A", "F", "G", "K", "M"]


def classify_stars(sky: dict) -> dict:
    """Compute spectral_weights, dominant_class, and dominant_star_example.

    Each visible star contributes its apparent flux (10^(-mag/2.5)) to its
    spectral class, so bright stars dominate the distribution — matching the
    visual experience of the night sky.

    Input sky dict must contain a ``star_positions`` list (as produced by
    ``core.sky_engine.compute_sky``). Each star must have ``spectral_class`` and
    ``magnitude`` keys.
    """
    flux_by_class: dict[str, float] = {c: 0.0 for c in PRIMARY_CLASSES}
    for star in sky.get("star_positions", []):
        c = star.get("spectral_class", "G")
        if c not in flux_by_class:
            continue
        mag = star.get("magnitude", 5)
        flux = 10 ** (-mag / 2.5)
        flux_by_class[c] += flux

    total = sum(flux_by_class.values()) or 1e-9
    weights = {c: round(flux_by_class[c] / total, 4) for c in PRIMARY_CLASSES}
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
