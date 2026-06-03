"""Part 2: trait profile and LLM narrative."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.trait_scorer import score_traits
from core.chronobiology import season_and_hemisphere
from llm.prompt_builder import build_prompt
from llm.narrative_client import generate_narrative

router = APIRouter()


class Part2Input(BaseModel):
    date: str
    time: str
    latitude: float
    longitude: float
    part1: dict | None = Field(default=None, description="Output of /api/part1")


@router.post("/part2")
def part2_endpoint(payload: Part2Input):
    """Return a scored trait profile plus a generated narrative."""
    chrono = season_and_hemisphere(
        date=payload.date,
        latitude=payload.latitude,
    )
    traits = score_traits(part1=payload.part1, chrono=chrono)
    prompt = build_prompt(
        part1=payload.part1,
        chrono=chrono,
        traits=traits,
    )
    narrative = generate_narrative(prompt)
    return {
        "birth": payload.model_dump(exclude={"part1"}),
        "chronobiology": chrono,
        "part2": {
            "traits": traits,
            "narrative": narrative,
        },
    }
