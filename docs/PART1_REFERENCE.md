# Stellar DNA — Part 1 Reference: Astrophysics Engine

> **Purpose of this file:** Complete reference for what Part 1 calculates, where data comes from, how each value is derived, and what gets handed to Part 2. Written for both human developers and AI coding agents.

---

## What Part 1 Does (One Sentence)

Takes a user's birth date and location, reconstructs the exact night sky visible from that spot at that moment, and returns 6 structured values describing the stellar composition of that sky.

---

## User Inputs

| Field | Type | Example |
|---|---|---|
| `birth_date` | ISO string `YYYY-MM-DD` | `"1999-09-14"` |
| `birth_time` | string `HH:MM` (optional, default `"21:00"`) | `"21:00"` |
| `latitude` | float, degrees | `31.5497` |
| `longitude` | float, degrees | `74.3436` |
| `location_name` | string (display only) | `"Lahore, Pakistan"` |

> **Note:** `latitude` and `longitude` come from a geocoding step — user types a city name, frontend calls a free geocoding API (e.g. OpenStreetMap Nominatim, no key required), gets back lat/lon, sends both to the backend.

---

## Part 1 Outputs — The 6 Values

These are the exact values that leave Part 1. Part 2 receives all 6.

| # | Output Name | Type | Example |
|---|---|---|---|
| 1 | `season` | string | `"autumn"` |
| 2 | `hemisphere` | string | `"northern"` or `"southern"` |
| 3 | `dominant_class` | string | `"B"` |
| 4 | `spectral_weights` | dict (float, sums to 1.0) | `{"O":0.05,"B":0.41,"A":0.22,"F":0.12,"G":0.10,"K":0.07,"M":0.03}` |
| 5 | `element_percentages` | dict (float, sums to ~1.0) | `{"C":0.38,"O":0.25,"Fe":0.17,"Ca":0.09,"N":0.07,...}` |
| 6 | `nucleosynthesis_path` | string | `"type_ii_sn"` |

Plus these display-only values returned to the frontend (not used in Part 2 scoring):

| Field | Type | Purpose |
|---|---|---|
| `star_positions` | list of `{name, ra, dec, magnitude, spectral_class, x, y, z}` | Three.js star map rendering |
| `dominant_star_example` | string | `"Rigel (Beta Orionis)"` — shown in UI |
| `rarest_element` | string | `"Gold (Au)"` — shown in UI |
| `rarest_element_origin` | string | `"kilonova r-process"` — shown in UI |
| `avg_atom_age_billion_years` | float | `"8.4"` — shown in UI |

---

## Calculation Chain

```
birth_date + birth_time + latitude + longitude
        │
        ├──► [1] Season             (date + latitude)
        ├──► [2] Hemisphere         (latitude sign)
        └──► [Sky Engine]
                │
                ├──► star_positions (ra/dec → alt/az → x/y/z)
                └──► visible_stars  (altitude > 0°, magnitude < 6.5)
                          │
                          ├──► [3] spectral_weights   (count by class, normalize)
                          ├──► dominant_class          (argmax of spectral_weights)
                          ├──► [5] element_percentages (spectral_weights × yield table)
                          └──► [6] nucleosynthesis_path (dominant element → path lookup)
```

---

## Calculation 1 — Season

**File:** `backend/core/chronobiology.py`

**Inputs:** `birth_date`, `latitude`

**Logic:**
```python
month = birth_date.month

# Meteorological seasons (not astronomical)
northern_seasons = {
    12: "winter", 1: "winter", 2: "winter",
    3: "spring",  4: "spring", 5: "spring",
    6: "summer",  7: "summer", 8: "summer",
    9: "autumn", 10: "autumn", 11: "autumn"
}

if latitude >= 0:
    hemisphere = "northern"
    season = northern_seasons[month]
else:
    hemisphere = "southern"
    # Southern hemisphere seasons are flipped
    opposite = {"winter":"summer","summer":"winter","spring":"autumn","autumn":"spring"}
    season = opposite[northern_seasons[month]]
```

**Output:** `season` (string), `hemisphere` (string)

---

## Calculation 2 — Hemisphere

**File:** `backend/core/chronobiology.py`

**Inputs:** `latitude`

**Logic:** Simply `"northern"` if `latitude >= 0` else `"southern"`. Derived as a byproduct of the season calculation above.

---

## Calculation 3 — Star Map + Spectral Weights

**File:** `backend/core/sky_engine.py`

**Library:** `skyfield` (install: `pip install skyfield`)

**Data:** `backend/data/hyg_database.csv` — HYG Database v3 (David Nash, public domain). Download from: https://github.com/astronexus/HYG-Database. Columns used: `ra`, `dec`, `mag`, `spect`, `proper` (star name), `x`, `y`, `z`.

**Logic:**
```python
from skyfield.api import Star, wgs84, load
from skyfield.data import mpc
import pandas as pd

def get_visible_stars(birth_date, birth_time, latitude, longitude):
    ts = load.timescale()
    t = ts.utc(birth_date.year, birth_date.month, birth_date.day,
               int(birth_time[:2]), int(birth_time[3:]))

    location = wgs84.latlon(latitude, longitude)
    observer = location.at(t)

    hyg = pd.read_csv("data/hyg_database.csv")
    hyg = hyg[hyg['mag'] < 6.5]  # naked-eye visible only

    visible = []
    for _, row in hyg.iterrows():
        star = Star(ra_hours=row['ra'], dec_degrees=row['dec'])
        astrometric = observer.observe(star)
        alt, az, _ = astrometric.apparent().altaz()
        if alt.degrees > 0:  # above horizon
            visible.append({
                "name": row.get("proper", f"HIP{row['hip']}"),
                "spectral_class": parse_spectral_class(row['spect']),
                "magnitude": row['mag'],
                "altitude": alt.degrees,
                "azimuth": az.degrees,
            })
    return visible
```

**Spectral class parsing:**
```python
def parse_spectral_class(spect_string):
    """Extract the primary OBAFGKM class from a full spectral string like 'B8Iab'"""
    if pd.isna(spect_string) or spect_string == "":
        return "G"  # default to solar-like if unknown
    first_char = str(spect_string).strip()[0].upper()
    return first_char if first_char in "OBAFGKM" else "G"
```

**Spectral weights calculation:**
```python
def compute_spectral_weights(visible_stars):
    classes = ["O", "B", "A", "F", "G", "K", "M"]
    counts = {c: 0 for c in classes}
    for star in visible_stars:
        c = star["spectral_class"]
        if c in counts:
            counts[c] += 1
    total = sum(counts.values()) or 1
    weights = {c: counts[c] / total for c in classes}
    dominant = max(weights, key=weights.get)
    return weights, dominant
```

---

## Calculation 4 — Element Percentages

**File:** `backend/core/nucleosynthesis.py`

**Inputs:** `spectral_weights`

**What this is:** Each spectral class of star has known nucleosynthesis yields — what elements it produces and in what proportions. This is taken from published astrophysics literature (Kobayashi et al. 2020, "The Origin of Elements from Carbon to Uranium", ApJ 900 179).

**The yield table (hardcoded, research-derived):**

```python
# Each entry is the fractional contribution of that spectral class
# to each element in a typical human body.
# Values are normalized approximations from stellar yield literature.

SPECTRAL_ELEMENT_YIELDS = {
    # class: {element: fractional_yield}
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

def compute_element_percentages(spectral_weights):
    elements = ["C", "O", "Fe", "Ca", "N", "Mg", "Si", "S", "Au", "other"]
    totals = {e: 0.0 for e in elements}
    for cls, weight in spectral_weights.items():
        yields = SPECTRAL_ELEMENT_YIELDS.get(cls, SPECTRAL_ELEMENT_YIELDS["G"])
        for elem in elements:
            totals[elem] += weight * yields.get(elem, 0)
    # normalize to sum to 1.0
    total = sum(totals.values()) or 1
    return {e: round(v / total, 4) for e, v in totals.items()}
```

---

## Calculation 5 — Nucleosynthesis Pathway

**File:** `backend/core/nucleosynthesis.py`

**Inputs:** `element_percentages`

**What this is:** Maps the dominant element group to the stellar process that created it. This is the "story" of how those atoms were born.

```python
ELEMENT_TO_PATHWAY = {
    "C":  "agb_winds",      # Asymptotic Giant Branch stars — gentle stellar winds
    "N":  "agb_winds",
    "O":  "type_ii_sn",     # Core-collapse supernova (massive star death)
    "Mg": "type_ii_sn",
    "Si": "type_ii_sn",
    "S":  "type_ii_sn",
    "Fe": "type_ia_sn",     # White dwarf thermonuclear explosion
    "Ca": "type_ia_sn",
    "Au": "r_process",      # Neutron star merger (kilonova)
    "Pt": "r_process",
    "U":  "r_process",
}

PATHWAY_DISPLAY = {
    "agb_winds":  "AGB stellar winds",
    "type_ii_sn": "Core-collapse supernova (Type II)",
    "type_ia_sn": "Thermonuclear supernova (Type Ia)",
    "r_process":  "Neutron star merger (kilonova r-process)",
    "big_bang":   "Big Bang nucleosynthesis",
}

def compute_nucleosynthesis_path(element_percentages):
    # exclude 'other', find dominant element
    scored = {e: v for e, v in element_percentages.items() if e != "other"}
    dominant_element = max(scored, key=scored.get)
    path = ELEMENT_TO_PATHWAY.get(dominant_element, "type_ii_sn")
    return path
```

---

## API Endpoint

**File:** `backend/routers/part1.py`

**Route:** `POST /api/part1`

**Request body:**
```json
{
  "birth_date": "1999-09-14",
  "birth_time": "21:00",
  "latitude": 31.5497,
  "longitude": 74.3436,
  "location_name": "Lahore, Pakistan"
}
```

**Response body:**
```json
{
  "season": "autumn",
  "hemisphere": "northern",
  "dominant_class": "B",
  "spectral_weights": {"O":0.05,"B":0.41,"A":0.22,"F":0.12,"G":0.10,"K":0.07,"M":0.03},
  "element_percentages": {"C":0.38,"O":0.25,"Fe":0.17,"Ca":0.09,"N":0.07,"Mg":0.02,"Si":0.01,"S":0.005,"Au":0.003,"other":0.002},
  "nucleosynthesis_path": "type_ii_sn",
  "star_positions": [...],
  "dominant_star_example": "Rigel (Beta Orionis)",
  "rarest_element": "Gold (Au)",
  "rarest_element_origin": "neutron star merger (r-process)",
  "avg_atom_age_billion_years": 8.4
}
```

---

## Data Sources

| Source | What it provides | URL / install |
|---|---|---|
| HYG Database v3 | 120k stars with ra, dec, mag, spectral type | https://github.com/astronexus/HYG-Database |
| skyfield | Sky position engine (alt/az from lat/lon/time) | `pip install skyfield` |
| astropy | Coordinate transforms, time standards | `pip install astropy` |
| Kobayashi et al. 2020 | Nucleosynthesis yield tables (basis for SPECTRAL_ELEMENT_YIELDS) | DOI: 10.3847/1538-4357/abae65 |
| OpenStreetMap Nominatim | Free geocoding (city name → lat/lon) | https://nominatim.openstreetmap.org |

---

## Python Dependencies (`requirements.txt`)

```
fastapi
uvicorn
skyfield
astropy
pandas
numpy
python-dotenv
httpx
```

---

## What Part 1 Does NOT Do

- It does not calculate personality traits — that is entirely Part 2.
- It does not call any LLM.
- It does not store anything — stateless, pure computation.
- `star_positions` is for display only and is not passed to Part 2.
