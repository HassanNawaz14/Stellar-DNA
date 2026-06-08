"""Build the LLM prompt from computed Stellar DNA data.

Sends all 6 Part 1 outputs + 3 display extras + 5 trait scores and
instructs the LLM to return valid JSON with ``archetype_name`` and
three narrative paragraphs.
"""


def _top_element(element_percentages: dict[str, float]) -> str:
    """Return the element key with the highest percentage (excluding 'other')."""
    scored = {e: v for e, v in element_percentages.items() if e != "other"}
    return max(scored, key=scored.get) if scored else "O"


def build_prompt(part1_outputs: dict, scores: dict) -> str:
    """Assemble a prompt for the LLM.

    Parameters
    ----------
    part1_outputs:
        Must contain keys: dominant_class, dominant_star_example, season,
        hemisphere, element_percentages, rarest_element, rarest_element_origin,
        nucleosynthesis_path.
    scores:
        Must contain keys: energy_score, pace_score, legacy_score,
        curiosity_type, temporal_score.
    """
    return f"""You are writing a "Stellar DNA" cosmic profile.
This is poetic and personal — inspired by real astrophysics, not astrology.
Rules:
- Write in second person ("you", "your") throughout.
- Never use generic horoscope language ("you are destined", "the stars say").
- Be specific — name the actual star type, actual element, actual process.
- End the third paragraph with exactly one sentence starting with "Note:" that says this is a poetic interpretation inspired by real stellar physics, not a scientific prediction.

REAL ASTROPHYSICS DATA FOR THIS USER:
- Dominant star type in birth sky: {part1_outputs['dominant_class']}-type (example star: {part1_outputs['dominant_star_example']})
- Birth season: {part1_outputs['season']}, {part1_outputs['hemisphere']} hemisphere
- Most abundant element in their body by stellar origin: {_top_element(part1_outputs['element_percentages'])}
- Rarest element and its origin: {part1_outputs['rarest_element']} — {part1_outputs['rarest_element_origin']}
- Nucleosynthesis pathway: {part1_outputs['nucleosynthesis_path']}

COMPUTED TRAIT SCORES (0–100):
- Energy score: {scores['energy_score']}/100 (0=calm/sustained like an M-dwarf, 100=explosive like an O-type star)
- Pace score: {scores['pace_score']}/100 (0=marathon/enduring, 100=sprint/urgent)
- Legacy score: {scores['legacy_score']}/100 (0=quiet/local impact, 100=explosive/far-reaching dispersal)
- Curiosity type: {scores['curiosity_type']} (one of: Structural, Elemental, Expansive, Deep)
- Temporal orientation: {scores['temporal_score']}/100 (0=present-anchored, 100=drawn to the long arc of time)

Write exactly 3 short paragraphs (max 130 words total):
1. Invent a unique 2–3 word archetype name for this person and explain what it means in terms of their stellar makeup. The name should feel like a title, not a zodiac sign.
2. How their energy ({scores['energy_score']}/100) and pace ({scores['pace_score']}/100) manifest — what they're like to be around, how they work, what they're drawn to.
3. Their relationship with legacy ({scores['legacy_score']}/100), curiosity ({scores['curiosity_type']}), and time ({scores['temporal_score']}/100).

Format your response as JSON:
{{
  "archetype_name": "...",
  "paragraph_1": "...",
  "paragraph_2": "...",
  "paragraph_3": "..."
}}
Return only valid JSON. No markdown, no preamble."""
