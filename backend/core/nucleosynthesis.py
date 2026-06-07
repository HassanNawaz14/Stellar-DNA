"""Nucleosynthesis element yield tables for Part 1 (and shared constants for Part 2).

The yield table is derived from published nucleosynthesis literature
(Kobayashi et al. 2020, ApJ 900 179). Each spectral class contributes a known
fractional yield per element; a user's final element breakdown is the
spectral-weight-weighted sum, renormalized to 1.0.

This module also defines ``ELEMENT_AGE_GYR`` and ``ELEMENT_TO_PATHWAY`` which
are used both here (for the rare-element / atom-age display values) and in
Part 2's ``trait_scorer.py`` (for the temporal-orientation and curiosity-type
scoring). Keeping the constants in one place guarantees the two parts stay
in lock-step.
"""

SPECTRAL_ELEMENT_YIELDS: dict[str, dict[str, float]] = {
    "O": {"C": 0.05, "O": 0.45, "Fe": 0.10, "Ca": 0.08, "N": 0.05,
          "Mg": 0.10, "Si": 0.10, "S": 0.05, "Au": 0.01, "other": 0.01},
    "B": {"C": 0.10, "O": 0.35, "Fe": 0.15, "Ca": 0.10, "N": 0.08,
          "Mg": 0.08, "Si": 0.07, "S": 0.04, "Au": 0.02, "other": 0.01},
    "A": {"C": 0.20, "O": 0.28, "Fe": 0.18, "Ca": 0.10, "N": 0.09,
          "Mg": 0.06, "Si": 0.05, "S": 0.02, "Au": 0.01, "other": 0.01},
    "F": {"C": 0.28, "O": 0.25, "Fe": 0.18, "Ca": 0.10, "N": 0.09,
          "Mg": 0.05, "Si": 0.03, "S": 0.01, "Au": 0.005, "other": 0.005},
    "G": {"C": 0.35, "O": 0.24, "Fe": 0.17, "Ca": 0.09, "N": 0.08,
          "Mg": 0.04, "Si": 0.02, "S": 0.01, "Au": 0.003, "other": 0.007},
    "K": {"C": 0.38, "O": 0.22, "Fe": 0.16, "Ca": 0.09, "N": 0.08,
          "Mg": 0.04, "Si": 0.02, "S": 0.005, "Au": 0.002, "other": 0.003},
    "M": {"C": 0.40, "O": 0.20, "Fe": 0.15, "Ca": 0.09, "N": 0.08,
          "Mg": 0.03, "Si": 0.02, "S": 0.005, "Au": 0.001, "other": 0.004},
}

ELEMENTS = ["C", "O", "Fe", "Ca", "N", "Mg", "Si", "S", "Au", "other"]

ELEMENT_TO_PATHWAY: dict[str, str] = {
    "C":  "agb_winds",
    "N":  "agb_winds",
    "O":  "type_ii_sn",
    "Mg": "type_ii_sn",
    "Si": "type_ii_sn",
    "S":  "type_ii_sn",
    "Fe": "type_ia_sn",
    "Ca": "type_ia_sn",
    "Au": "r_process",
    "Pt": "r_process",
    "U":  "r_process",
}

PATHWAY_DISPLAY: dict[str, str] = {
    "agb_winds":  "AGB stellar winds",
    "type_ii_sn": "Core-collapse supernova (Type II)",
    "type_ia_sn": "Thermonuclear supernova (Type Ia)",
    "r_process":  "Neutron star merger (kilonova r-process)",
    "big_bang":   "Big Bang nucleosynthesis",
}

ELEMENT_DISPLAY: dict[str, str] = {
    "C":  "Carbon (C)",
    "N":  "Nitrogen (N)",
    "O":  "Oxygen (O)",
    "Mg": "Magnesium (Mg)",
    "Si": "Silicon (Si)",
    "S":  "Sulfur (S)",
    "Fe": "Iron (Fe)",
    "Ca": "Calcium (Ca)",
    "Au": "Gold (Au)",
    "other": "Other",
}

ELEMENT_AGE_GYR: dict[str, float] = {
    "C": 6.0, "N": 5.5, "O": 7.0, "Mg": 7.5, "Si": 7.0, "S": 6.5,
    "Fe": 3.5, "Ca": 4.0, "Au": 8.0, "other": 5.0,
}


def element_yields(spectral_weights: dict[str, float]) -> dict:
    """Compute the per-user elemental breakdown plus display-only helpers.

    Returns:
      element_percentages: dict element -> fraction (sums to ~1.0)
      nucleosynthesis_path: pathway code (e.g. "type_ii_sn") for dominant element
      rarest_element: human label, e.g. "Gold (Au)"
      rarest_element_origin: human label of the pathway that produced it
      avg_atom_age_billion_years: weighted-mean age of the user's atoms in Gyr
    """
    totals: dict[str, float] = {e: 0.0 for e in ELEMENTS}
    for cls, weight in spectral_weights.items():
        yields = SPECTRAL_ELEMENT_YIELDS.get(cls, SPECTRAL_ELEMENT_YIELDS["G"])
        for element in ELEMENTS:
            totals[element] += weight * yields.get(element, 0.0)

    total = sum(totals.values()) or 1.0
    element_percentages = {e: round(totals[e] / total, 4) for e in ELEMENTS}

    scored = {e: v for e, v in element_percentages.items() if e != "other"}
    dominant_element = max(scored, key=scored.get) if scored else "O"
    nucleosynthesis_path = ELEMENT_TO_PATHWAY.get(dominant_element, "type_ii_sn")

    non_zero = {e: v for e, v in element_percentages.items() if e != "other" and v > 0}
    rarest_element_key = min(non_zero, key=non_zero.get) if non_zero else dominant_element
    rarest_origin_key = ELEMENT_TO_PATHWAY.get(rarest_element_key, nucleosynthesis_path)

    avg_age = sum(
        element_percentages.get(e, 0.0) * ELEMENT_AGE_GYR.get(e, 5.0)
        for e in element_percentages
    )

    return {
        "element_percentages": element_percentages,
        "nucleosynthesis_path": nucleosynthesis_path,
        "rarest_element": ELEMENT_DISPLAY.get(rarest_element_key, rarest_element_key),
        "rarest_element_origin": PATHWAY_DISPLAY.get(rarest_origin_key, "").lower(),
        "avg_atom_age_billion_years": round(avg_age, 2),
    }
