"""Part 2: trait profile and LLM narrative.

Accepts the same flat 9-field shape that the frontend ``api/client.js``
``postPart2()`` sends, computes the 5 trait scores, builds an LLM prompt
from all 14 values, and returns the 9-field Part 2 response that the
frontend ``TraitProfile.jsx`` renders.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from core.trait_scorer import score_all
from llm.prompt_builder import build_prompt
from llm.narrative_client import generate_narrative

router = APIRouter()


class Part2Input(BaseModel):
    season: str
    hemisphere: str
    dominant_class: str
    dominant_star_example: str | None = None
    spectral_weights: dict[str, float]
    element_percentages: dict[str, float]
    nucleosynthesis_path: str
    rarest_element: str | None = None
    rarest_element_origin: str | None = None


@router.post("/part2")
async def part2_endpoint(payload: Part2Input):
    """Compute 5 trait scores and generate an LLM narrative."""
    part1 = {
        "season": payload.season,
        "hemisphere": payload.hemisphere,
        "dominant_class": payload.dominant_class,
        "dominant_star_example": payload.dominant_star_example or "",
        "spectral_weights": payload.spectral_weights,
        "element_percentages": payload.element_percentages,
        "nucleosynthesis_path": payload.nucleosynthesis_path,
        "rarest_element": payload.rarest_element or "",
        "rarest_element_origin": payload.rarest_element_origin or "",
    }

    scores = score_all(
        spectral_weights=payload.spectral_weights,
        season=payload.season,
        nucleosynthesis_path=payload.nucleosynthesis_path,
        element_percentages=payload.element_percentages,
    )

    prompt = build_prompt(part1_outputs=part1, scores=scores)

    try:
        narrative = await generate_narrative(prompt)
    except Exception:
        narrative = {}

    return {
        "energy_score": scores["energy_score"],
        "pace_score": scores["pace_score"],
        "legacy_score": scores["legacy_score"],
        "curiosity_type": scores["curiosity_type"],
        "temporal_score": scores["temporal_score"],
        "archetype_name": narrative.get("archetype_name", ""),
        "narrative_p1": narrative.get("paragraph_1", ""),
        "narrative_p2": narrative.get("paragraph_2", ""),
        "narrative_p3": narrative.get("paragraph_3", ""),
    }
