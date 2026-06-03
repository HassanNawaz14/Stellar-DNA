"""Build the LLM prompt from computed Stellar DNA data."""


def build_prompt(part1: dict | None, chrono: dict, traits: dict[str, float]) -> str:
    """Assemble a prompt describing the user's Stellar DNA for the LLM."""
    elements = (part1 or {}).get("elements", [])
    top = ", ".join(f"{e['element']} ({e['value']:.3f})" for e in elements[:5])
    trait_str = ", ".join(f"{k}={v:.2f}" for k, v in traits.items())
    return (
        "You are a poetic cosmic biographer. Given the following Stellar DNA "
        "data, write a 3-paragraph narrative portrait of the person.\n\n"
        f"Hemisphere: {chrono.get('hemisphere')}\n"
        f"Season: {chrono.get('season')}\n"
        f"Top elements: {top}\n"
        f"Traits: {trait_str}\n"
    )
