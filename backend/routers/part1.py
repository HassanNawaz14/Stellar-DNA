"""Part 1 router: stellar sky + elemental profile.

Accepts the same field names the frontend ``api/client.js`` sends
(``birth_date``, ``birth_time``, ``latitude``, ``longitude``, ``location_name``)
and returns a flat response shape that:

  1. matches what the frontend ``Profile.jsx`` renders directly (StarMap,
     ProfileCard, ElementChart, SpectralBar).
  2. is the exact 6-value contract that Part 2 will consume when wired next
     (see ``docs/PART2_REFERENCE.md`` §Inputs to Part 2).
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.chronobiology import season_and_hemisphere
from core.nucleosynthesis import element_yields
from core.sky_engine import compute_sky
from core.spectral_classifier import classify_stars
from core.trait_scorer import compute_sky_diversity

router = APIRouter()


class BirthInput(BaseModel):
    birth_date: str = Field(..., description="Birth date YYYY-MM-DD")
    birth_time: str = Field(..., description="Birth time HH:MM (24h)")
    latitude: float
    longitude: float
    location_name: str | None = None


@router.post("/part1")
def part1_endpoint(payload: BirthInput):
    """Reconstruct the birth sky, classify it, and compute the elemental breakdown."""
    chrono = season_and_hemisphere(
        date=payload.birth_date,
        latitude=payload.latitude,
    )
    sky = compute_sky(
        date=payload.birth_date,
        time=payload.birth_time,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    classified = classify_stars(sky)
    elements = element_yields(classified["spectral_weights"])

    return {
        "birth": {
            "birth_date": payload.birth_date,
            "birth_time": payload.birth_time,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "location_name": payload.location_name,
        },
        # The 6 Part 1 outputs (Part 2 consumes these):
        "season": chrono["season"],
        "hemisphere": chrono["hemisphere"],
        "dominant_class": classified["dominant_class"],
        "spectral_weights": classified["spectral_weights"],
        "element_percentages": elements["element_percentages"],
        "nucleosynthesis_path": elements["nucleosynthesis_path"],
        # Part 2 input: how many spectral classes have >5% of the visible sky
        "sky_diversity": compute_sky_diversity(classified["spectral_weights"]),
        # Display-only extras (frontend renders these, Part 2 ignores them):
        "dominant_star_example": classified["dominant_star_example"],
        "rarest_element": elements["rarest_element"],
        "rarest_element_origin": elements["rarest_element_origin"],
        "avg_atom_age_billion_years": elements["avg_atom_age_billion_years"],
        "star_positions": sky["star_positions"],
    }
