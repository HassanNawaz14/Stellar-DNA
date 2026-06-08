"""Trait scoring for Part 2 of the Stellar DNA profile.

Five deterministic trait dimensions computed from the 6 Part 1 outputs:
  - Energy       (spectral_weights -> weighted temperature/luminosity)
  - Pace         (spectral_weights + season -> lifespan + chronobiology)
  - Legacy       (nucleosynthesis_path -> dispersal distance)
  - Curiosity    (element_percentages + spectral_weights -> rule table)
  - Temporal     (element_percentages -> weighted atom age)
"""

# ─── Energy: spectral class -> temperature/luminosity ────────────────────────

CLASS_ENERGY = {"O": 98, "B": 85, "A": 68, "F": 55, "G": 40, "K": 25, "M": 10}


def compute_energy_score(spectral_weights: dict[str, float]) -> int:
    """Weighted average of spectral class energy values, clamped 0–100."""
    score = sum(spectral_weights.get(cls, 0) * val
                for cls, val in CLASS_ENERGY.items())
    return max(0, min(100, round(score)))


# ─── Pace: spectral class -> lifespan (inverse) + season modifier ─────────────

CLASS_PACE_BASE = {"O": 95, "B": 80, "A": 65, "F": 50, "G": 35, "K": 20, "M": 5}
SEASON_MODIFIER = {"summer": 10, "spring": 5, "autumn": -3, "winter": -8}


def compute_pace_score(spectral_weights: dict[str, float], season: str) -> int:
    """Weighted lifespan inverse + season modifier, clamped 0–100."""
    base = sum(spectral_weights.get(cls, 0) * val
               for cls, val in CLASS_PACE_BASE.items())
    modifier = SEASON_MODIFIER.get(season, 0)
    return max(0, min(100, round(base + modifier)))


# ─── Legacy: nucleosynthesis pathway -> dispersal distance ────────────────────

PATH_LEGACY = {
    "big_bang": 15,
    "agb_winds": 35,
    "type_ii_sn": 65,
    "type_ia_sn": 80,
    "r_process": 95,
}


def compute_legacy_score(nucleosynthesis_path: str) -> int:
    """Look up dispersal score from nucleosynthesis pathway code."""
    return PATH_LEGACY.get(nucleosynthesis_path, 50)


# ─── Curiosity type: element / spectral-diversity rule table ──────────────────


def compute_sky_diversity(spectral_weights: dict[str, float]) -> int:
    """Count OBAFGKM classes with >5% representation (1–7).

    Used by the curiosity-type rule table and exposed via the Part 1 API
    response so both stages share one source of truth.
    """
    return sum(1 for w in spectral_weights.values() if w > 0.05)


def compute_curiosity_type(
    element_percentages: dict[str, float],
    spectral_weights: dict[str, float],
) -> str:
    """Rule-based categorical: Structural, Elemental, Expansive, or Deep."""
    diversity = compute_sky_diversity(spectral_weights)

    # r-process check first — rarest, takes priority
    if element_percentages.get("Au", 0) > 0.005:
        return "Deep"

    scored = {e: v for e, v in element_percentages.items() if e != "other"}
    if not scored:
        return "Expansive"
    dominant = max(scored, key=scored.get)

    carbon_group = {"C", "N"}
    iron_group = {"Fe", "Ca"}
    oxygen_group = {"O", "Mg", "Si", "S"}

    if dominant in carbon_group and diversity >= 4:
        return "Structural"
    if dominant in iron_group and diversity < 4:
        return "Elemental"
    if dominant in oxygen_group and diversity >= 4:
        return "Expansive"
    return "Expansive"


# ─── Temporal orientation: weighted mean atom age (Gyr) -> 0–100 ──────────────

ELEMENT_AGE_GYR = {
    "C": 6.0, "N": 5.5, "O": 7.0, "Fe": 3.5,
    "Ca": 4.0, "Mg": 7.5, "Si": 7.0, "S": 6.5,
    "Au": 8.0, "other": 5.0,
}
MAX_AGE = 13.5  # Big Bang hydrogen
MIN_AGE = 2.0   # youngest realistic stellar ejecta


def compute_temporal_score(element_percentages: dict[str, float]) -> int:
    """Weighted mean atom age normalized to 0–100."""
    weighted_age = sum(
        element_percentages.get(e, 0) * ELEMENT_AGE_GYR.get(e, 5.0)
        for e in element_percentages
    )
    normalized = (weighted_age - MIN_AGE) / (MAX_AGE - MIN_AGE)
    return max(0, min(100, round(normalized * 100)))


# ─── Convenience: run all 5 at once ──────────────────────────────────────────


def score_all(
    spectral_weights: dict[str, float],
    season: str,
    nucleosynthesis_path: str,
    element_percentages: dict[str, float],
) -> dict:
    """Compute all 5 trait scores and return them as a dict."""
    return {
        "energy_score": compute_energy_score(spectral_weights),
        "pace_score": compute_pace_score(spectral_weights, season),
        "legacy_score": compute_legacy_score(nucleosynthesis_path),
        "curiosity_type": compute_curiosity_type(element_percentages, spectral_weights),
        "temporal_score": compute_temporal_score(element_percentages),
    }
