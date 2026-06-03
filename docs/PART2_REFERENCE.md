# Stellar DNA — Part 2 Reference: Trait Engine

> **Purpose of this file:** Complete reference for how Part 2 receives Part 1's outputs, scores 5 trait dimensions through pure math, and calls an LLM to generate a unique personal narrative. Written for both human developers and AI coding agents.

---

## What Part 2 Does (One Sentence)

Receives the 6 Part 1 outputs, runs deterministic scoring functions to produce 5 trait dimension scores, then calls a free LLM API with all 11 values to generate a unique narrative profile for that specific user.

---

## Inputs to Part 2 — The 6 Values from Part 1

Part 2 receives exactly these 6 values. Nothing else from Part 1 is used.

| # | Name | Type | Example |
|---|---|---|---|
| 1 | `season` | string | `"autumn"` |
| 2 | `hemisphere` | string | `"northern"` |
| 3 | `dominant_class` | string | `"B"` |
| 4 | `spectral_weights` | dict float | `{"O":0.05,"B":0.41,"A":0.22,...}` |
| 5 | `element_percentages` | dict float | `{"C":0.38,"O":0.25,"Fe":0.17,...}` |
| 6 | `nucleosynthesis_path` | string | `"type_ii_sn"` |

> These come directly from the Part 1 API response. The frontend passes them straight through to the Part 2 API call. No transformation happens in the frontend.

---

## Part 2 Outputs

| Output | Type | Goes to |
|---|---|---|
| `energy_score` | int 0–100 | LLM prompt + UI display |
| `pace_score` | int 0–100 | LLM prompt + UI display |
| `legacy_score` | int 0–100 | LLM prompt + UI display |
| `curiosity_type` | string (4 options) | LLM prompt + UI display |
| `temporal_score` | int 0–100 | LLM prompt + UI display |
| `archetype_name` | string | UI headline |
| `narrative_p1` | string | UI — paragraph 1 |
| `narrative_p2` | string | UI — paragraph 2 |
| `narrative_p3` | string | UI — paragraph 3 |

---

## Score 1 — Energy Score

**File:** `backend/core/trait_scorer.py`

**Inputs:** `spectral_weights`

**What it represents:** How intensely someone burns — calm and sustained (low) vs explosive and concentrated (high). Derived from stellar surface temperatures and luminosities, which are real measurable physics.

**Spectral class → energy map (based on temperature/luminosity data):**

| Class | Energy value | Physics basis |
|---|---|---|
| M | 10 | 2,400–3,700 K surface temp, trillion-year lifespan |
| K | 25 | 3,700–5,200 K, very long-lived |
| G | 40 | 5,200–6,000 K, Sun-like |
| F | 55 | 6,000–7,500 K, shorter lifespan than Sun |
| A | 68 | 7,500–10,000 K, high UV output |
| B | 85 | 10,000–30,000 K, 10,000× solar luminosity |
| O | 98 | 30,000–50,000 K, lives only ~3 million years |

**Formula:**
```python
CLASS_ENERGY = {"O": 98, "B": 85, "A": 68, "F": 55, "G": 40, "K": 25, "M": 10}

def compute_energy_score(spectral_weights):
    score = sum(spectral_weights[cls] * CLASS_ENERGY[cls] for cls in spectral_weights)
    return round(score)  # 0–100 integer
```

> This is a weighted average — a sky with 60% B-type and 40% G-type gives (0.6×85)+(0.4×40) = 67, not just "B = 85". Every user gets a continuous value, not a bucket.

---

## Score 2 — Pace Score

**File:** `backend/core/trait_scorer.py`

**Inputs:** `spectral_weights`, `season`, `hemisphere`

**What it represents:** Sprint vs marathon. Short urgent bursts (high) vs long enduring effort (low). Stellar lifespan is the base; chronobiology research on birth season modulates it.

**Stellar lifespan → pace base (inverse of lifespan, normalized):**

| Class | Typical lifespan | Pace base |
|---|---|---|
| O | ~3 million years | 95 |
| B | ~100 million years | 80 |
| A | ~1 billion years | 65 |
| F | ~3 billion years | 50 |
| G | ~10 billion years | 35 |
| K | ~30 billion years | 20 |
| M | ~1 trillion years | 5 |

**Season modifier (from chronobiology research — Chotai et al. 2003, Boland & Kessler 2002):**

Season modifiers reflect documented weak correlations between birth season and dopaminergic tone / circadian rhythm tendencies. Values are small intentionally — this is a modifier, not a driver.

| Season | Modifier |
|---|---|
| summer | +10 |
| spring | +5 |
| autumn | -3 |
| winter | -8 |

> Hemisphere is already baked into `season` from Part 1 (a southern-hemisphere user born in June has `season = "winter"`), so no additional hemisphere logic is needed here.

**Formula:**
```python
CLASS_PACE_BASE = {"O": 95, "B": 80, "A": 65, "F": 50, "G": 35, "K": 20, "M": 5}
SEASON_MODIFIER = {"summer": 10, "spring": 5, "autumn": -3, "winter": -8}

def compute_pace_score(spectral_weights, season):
    base = sum(spectral_weights[cls] * CLASS_PACE_BASE[cls] for cls in spectral_weights)
    modifier = SEASON_MODIFIER.get(season, 0)
    return max(0, min(100, round(base + modifier)))
```

---

## Score 3 — Legacy Score

**File:** `backend/core/trait_scorer.py`

**Inputs:** `nucleosynthesis_path`, `element_percentages`

**What it represents:** How far someone's impact tends to spread — quiet and local (low) vs explosive and galaxy-wide (high). Based on the physical dispersal distance of each nucleosynthesis process.

**Nucleosynthesis path → dispersal score:**

| Path | Score | Physics basis |
|---|---|---|
| `big_bang` | 15 | H and He, everywhere uniformly — ancient, diffuse |
| `agb_winds` | 35 | Slow stellar winds, spreads ~a few light-years |
| `type_ii_sn` | 65 | Core-collapse SN, ejects material ~30 light-years |
| `type_ia_sn` | 80 | Thermonuclear SN, disperses across galaxy arms |
| `r_process` | 95 | Kilonova (neutron star merger), extremely rare, elements scattered across thousands of light-years |

**Formula:**
```python
PATH_LEGACY = {
    "big_bang": 15,
    "agb_winds": 35,
    "type_ii_sn": 65,
    "type_ia_sn": 80,
    "r_process": 95,
}

def compute_legacy_score(nucleosynthesis_path):
    return PATH_LEGACY.get(nucleosynthesis_path, 50)
```

---

## Score 4 — Curiosity Type

**File:** `backend/core/trait_scorer.py`

**Inputs:** `element_percentages`, `spectral_weights`

**What it represents:** The *kind* of curiosity — not how curious, but what shape that curiosity takes. Categorical, not a spectrum.

**Sky diversity calculation:**
```python
def compute_sky_diversity(spectral_weights):
    # Count how many classes have >5% representation
    return sum(1 for w in spectral_weights.values() if w > 0.05)
    # Returns 1–7. Low = narrow sky, high = diverse sky.
```

**Curiosity type decision table:**

| Dominant element group | Sky diversity | Curiosity type | Meaning |
|---|---|---|---|
| C or N (carbon group) | ≥ 4 | `"Structural"` | Builders, systems thinkers, architecture of ideas |
| Fe or Ca (iron group) | < 4 | `"Elemental"` | Depth over breadth, obsessive specialist focus |
| O, Mg, Si (oxygen group) | ≥ 4 | `"Expansive"` | Generalists, connectors, drawn to scale |
| Au, Pt, U (r-process group) | any | `"Deep"` | Rare, drawn to extremes, threshold crossers |
| anything | any | `"Expansive"` | Default fallback |

**Formula:**
```python
def compute_curiosity_type(element_percentages, spectral_weights):
    diversity = compute_sky_diversity(spectral_weights)

    # Identify dominant element group
    # r-process check first — rarest, takes priority
    if element_percentages.get("Au", 0) > 0.005:
        return "Deep"

    # Find the dominant non-'other' element
    scored = {e: v for e, v in element_percentages.items() if e != "other"}
    dominant = max(scored, key=scored.get)

    carbon_group  = {"C", "N"}
    iron_group    = {"Fe", "Ca"}
    oxygen_group  = {"O", "Mg", "Si", "S"}

    if dominant in carbon_group and diversity >= 4:
        return "Structural"
    if dominant in iron_group and diversity < 4:
        return "Elemental"
    if dominant in oxygen_group and diversity >= 4:
        return "Expansive"
    return "Expansive"  # default
```

---

## Score 5 — Temporal Orientation

**File:** `backend/core/trait_scorer.py`

**Inputs:** `element_percentages`

**What it represents:** Whether someone feels more anchored to the present or drawn toward the long arc of time and legacy. Based on the actual age of the dominant atoms in a human body — hydrogen from the Big Bang is 13.8 billion years old; iron from a recent Type Ia supernova might be only 2–3 billion years old.

**Element → typical origin age (billion years):**

| Element | Typical age (Gyr) | Source |
|---|---|---|
| H (as C-H bonds) | 13.5 | Big Bang era |
| He | 13.5 | Big Bang era |
| C | 6.0 | AGB stars, spread across galactic history |
| N | 5.5 | AGB stars |
| O | 7.0 | Core-collapse SNe, early universe |
| Mg | 7.5 | Core-collapse SNe |
| Si | 7.0 | Core-collapse SNe |
| Fe | 3.5 | Type Ia SNe, more recent |
| Ca | 4.0 | Type Ia SNe |
| Au | 8.0 | Kilonovae, rare, distributed across time |

**Formula:**
```python
ELEMENT_AGE_GYR = {
    "C": 6.0, "N": 5.5, "O": 7.0, "Fe": 3.5,
    "Ca": 4.0, "Mg": 7.5, "Si": 7.0, "S": 6.5,
    "Au": 8.0, "other": 5.0,
}
MAX_AGE = 13.5  # Big Bang hydrogen
MIN_AGE = 2.0   # youngest realistic stellar ejecta

def compute_temporal_score(element_percentages):
    weighted_age = sum(
        element_percentages.get(e, 0) * ELEMENT_AGE_GYR.get(e, 5.0)
        for e in element_percentages
    )
    # normalize to 0–100
    normalized = (weighted_age - MIN_AGE) / (MAX_AGE - MIN_AGE)
    return max(0, min(100, round(normalized * 100)))
```

---

## The LLM Call

**File:** `backend/llm/prompt_builder.py` + `backend/llm/narrative_client.py`

### Why an LLM and not a lookup table

The 5 scores + 6 raw values produce a combinatorial space large enough that no two users read the same profile. The LLM call is what turns those 11 numbers into a paragraph that feels written for that specific person — uniqueness comes from generative language, not from having thousands of distinct template branches.

### What gets sent to the LLM

All 11 values: the 6 Part 1 outputs + the 5 computed scores.

```python
def build_prompt(part1_outputs: dict, scores: dict) -> str:
    return f"""
You are writing a "Stellar DNA" cosmic profile. 
This is poetic and personal — inspired by real astrophysics, not astrology.
Rules:
- Write in second person ("you", "your") throughout.
- Never use generic horoscope language ("you are destined", "the stars say").
- Be specific — name the actual star type, actual element, actual process.
- End the third paragraph with exactly one sentence starting with "Note:" that says
  this is a poetic interpretation inspired by real stellar physics, not a scientific prediction.

REAL ASTROPHYSICS DATA FOR THIS USER:
- Dominant star type in birth sky: {part1_outputs['dominant_class']}-type
  (example star: {part1_outputs['dominant_star_example']})
- Birth season: {part1_outputs['season']}, {part1_outputs['hemisphere']} hemisphere
- Most abundant element in their body by stellar origin: {_top_element(part1_outputs['element_percentages'])}
- Rarest element and its origin: {part1_outputs['rarest_element']} — {part1_outputs['rarest_element_origin']}
- Nucleosynthesis pathway: {part1_outputs['nucleosynthesis_path']}

COMPUTED TRAIT SCORES (0–100):
- Energy score: {scores['energy_score']}/100
  (0=calm/sustained like an M-dwarf, 100=explosive like an O-type star)
- Pace score: {scores['pace_score']}/100
  (0=marathon/enduring, 100=sprint/urgent)
- Legacy score: {scores['legacy_score']}/100
  (0=quiet/local impact, 100=explosive/far-reaching dispersal)
- Curiosity type: {scores['curiosity_type']}
  (one of: Structural, Elemental, Expansive, Deep)
- Temporal orientation: {scores['temporal_score']}/100
  (0=present-anchored, 100=drawn to the long arc of time)

Write exactly 3 short paragraphs (max 130 words total):
1. Invent a unique 2–3 word archetype name for this person and explain what it means 
   in terms of their stellar makeup. The name should feel like a title, not a zodiac sign.
2. How their energy ({scores['energy_score']}/100) and pace ({scores['pace_score']}/100) 
   manifest — what they're like to be around, how they work, what they're drawn to.
3. Their relationship with legacy ({scores['legacy_score']}/100), curiosity 
   ({scores['curiosity_type']}), and time ({scores['temporal_score']}/100).

Format your response as JSON:
{{
  "archetype_name": "...",
  "paragraph_1": "...",
  "paragraph_2": "...",
  "paragraph_3": "..."
}}
Return only valid JSON. No markdown, no preamble.
"""

def _top_element(element_percentages):
    scored = {e: v for e, v in element_percentages.items() if e != "other"}
    return max(scored, key=scored.get)
```

### LLM API clients

**Primary: Google Gemini 1.5 Flash (free tier)**
- 15 requests/min, 1M tokens/day, no credit card
- Get key: https://aistudio.google.com/app/apikey

```python
# backend/llm/narrative_client.py
import httpx, os, json

async def call_gemini(prompt: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.85,      # high enough for varied narratives
            "maxOutputTokens": 500,
            "responseMimeType": "application/json"
        }
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=body, timeout=30)
        r.raise_for_status()
        raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw)
```

**Fallback: Groq (Llama 3, free tier)**
- 14,400 requests/day, sub-second response
- Get key: https://console.groq.com

```python
async def call_groq(prompt: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.85,
        "max_tokens": 500,
        "response_format": {"type": "json_object"}
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, headers=headers, json=body, timeout=30)
        r.raise_for_status()
        raw = r.json()["choices"][0]["message"]["content"]
        return json.loads(raw)

async def generate_narrative(prompt: str) -> dict:
    """Try Gemini first, fall back to Groq."""
    try:
        return await call_gemini(prompt)
    except Exception:
        return await call_groq(prompt)
```

---

## API Endpoint

**File:** `backend/routers/part2.py`

**Route:** `POST /api/part2`

**Request body:** (everything from Part 1 response, passed straight through by frontend)
```json
{
  "season": "autumn",
  "hemisphere": "northern",
  "dominant_class": "B",
  "dominant_star_example": "Rigel (Beta Orionis)",
  "spectral_weights": {"O":0.05,"B":0.41,"A":0.22,"F":0.12,"G":0.10,"K":0.07,"M":0.03},
  "element_percentages": {"C":0.38,"O":0.25,"Fe":0.17,"Ca":0.09,"N":0.07,"Mg":0.02,"Si":0.01,"S":0.005,"Au":0.003,"other":0.002},
  "nucleosynthesis_path": "type_ii_sn",
  "rarest_element": "Gold (Au)",
  "rarest_element_origin": "neutron star merger (r-process)"
}
```

**Response body:**
```json
{
  "energy_score": 74,
  "pace_score": 77,
  "legacy_score": 65,
  "curiosity_type": "Expansive",
  "temporal_score": 48,
  "archetype_name": "Shockwave Architect",
  "narrative_p1": "...",
  "narrative_p2": "...",
  "narrative_p3": "..."
}
```

---

## Environment Variables

Store in `backend/.env` — never commit this file.

```
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```

Load in FastAPI with:
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## Complete Scoring Summary (Quick Reference)

| Score | Inputs used | Formula type | Range |
|---|---|---|---|
| Energy | `spectral_weights` | Weighted average of class temp map | 0–100 int |
| Pace | `spectral_weights` + `season` | Weighted average of lifespan map + season modifier | 0–100 int |
| Legacy | `nucleosynthesis_path` | Direct lookup table | 0–100 int |
| Curiosity | `element_percentages` + `spectral_weights` | Rule-based categorical | 4 string options |
| Temporal | `element_percentages` | Weighted average of atom age map, normalized | 0–100 int |

---

## What Part 2 Does NOT Do

- It does not call any external astronomy API — all science inputs come from Part 1.
- It does not use a trained ML model — all scoring is deterministic math.
- It does not store profiles — stateless, compute on demand.
- It does not generate personality claims as fact — the LLM prompt explicitly frames everything as poetic interpretation, and the third paragraph always ends with the "Note:" disclaimer.
