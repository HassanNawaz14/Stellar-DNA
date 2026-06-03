"""Nucleosynthesis element yield tables.

Mapping from spectral class -> expected mass-fraction of H/He/C/O/.../Fe
released into the ISM by the star's lifetime. Used to build a per-person
elemental breakdown.
"""

ELEMENT_YIELDS: dict[str, dict[str, float]] = {
    "O": {"H": 0.71, "He": 0.27, "O": 0.008, "C": 0.003, "N": 0.001, "Fe": 0.001},
    "B": {"H": 0.70, "He": 0.27, "O": 0.010, "C": 0.005, "N": 0.002, "Fe": 0.003},
    "A": {"H": 0.68, "He": 0.26, "O": 0.012, "C": 0.007, "N": 0.003, "Fe": 0.008},
    "F": {"H": 0.65, "He": 0.24, "O": 0.014, "C": 0.010, "N": 0.004, "Fe": 0.020},
    "G": {"H": 0.60, "He": 0.22, "O": 0.017, "C": 0.013, "N": 0.005, "Fe": 0.045},
    "K": {"H": 0.55, "He": 0.20, "O": 0.020, "C": 0.015, "N": 0.006, "Fe": 0.060},
    "M": {"H": 0.50, "He": 0.18, "O": 0.025, "C": 0.018, "N": 0.007, "Fe": 0.080},
}


def element_yields(classified_stars: list[dict]) -> list[dict]:
    """Aggregate per-element yield across the visible stellar population.

    Returns a list of ``{element, value}`` dicts suitable for the D3 pie chart.
    """
    totals: dict[str, float] = {}
    for star in classified_stars:
        spectral = star.get("spectral_class", "G")
        weights = ELEMENT_YIELDS.get(spectral, ELEMENT_YIELDS["G"])
        magnitude_weight = 1.0 / max(0.1, star.get("magnitude", 1.0))
        for element, fraction in weights.items():
            totals[element] = totals.get(element, 0.0) + fraction * magnitude_weight
    return [{"element": k, "value": v} for k, v in sorted(totals.items(), key=lambda kv: -kv[1])]
