"""Part 1: stellar sky and elemental profile."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.sky_engine import compute_sky
from core.spectral_classifier import classify_stars
from core.nucleosynthesis import element_yields

router = APIRouter()


class BirthInput(BaseModel):
    date: str = Field(..., description="Birth date YYYY-MM-DD")
    time: str = Field(..., description="Birth time HH:MM (24h)")
    latitude: float
    longitude: float
    locationName: str | None = None


@router.post("/part1")
def part1_endpoint(payload: BirthInput):
    """Return the stellar sky + elemental breakdown for a birth."""
    sky = compute_sky(
        date=payload.date,
        time=payload.time,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    classified = classify_stars(sky)
    elements = element_yields(classified)
    return {
        "birth": payload.model_dump(),
        "part1": {
            "sky": sky,
            "stars": classified,
            "elements": elements,
        },
    }
