"""Skyfield-based sky calculations for Part 1.

Loads the HYG star catalog, filters by naked-eye magnitude (< 6.5), and uses
skyfield to find which stars are above the horizon at a given birth moment.
Returns unit-vector positions on a celestial sphere so the frontend Three.js
star map can render them directly.
"""

import csv
import math
from datetime import datetime, timezone
from pathlib import Path

HYG_PATH = Path(__file__).resolve().parent.parent / "data" / "hyg_database.csv"

PRIMARY_SPECTRAL = set("OBAFGKM")
NAKED_EYE_LIMIT = 6.5


def _parse_spectral(spect: str) -> str:
    """Extract the primary OBAFGKM class from a full spectral string like 'B8Iab'."""
    if not spect:
        return "G"
    first = str(spect).strip()[:1].upper()
    return first if first in PRIMARY_SPECTRAL else "G"


def _ra_dec_to_unit_vec(ra_hours: float, dec_deg: float) -> tuple[float, float, float]:
    """Convert RA/Dec to a unit vector on a celestial sphere.

    RA in hours [0, 24), Dec in degrees [-90, 90]. Matches the convention used
    by the frontend's raDecToVec3 helper so the same star maps to the same point.
    """
    ra = (ra_hours / 24.0) * 2.0 * math.pi
    dec = (dec_deg * math.pi) / 180.0
    x = math.cos(dec) * math.cos(ra)
    y = math.sin(dec)
    z = math.cos(dec) * math.sin(ra)
    return x, y, z


def _iter_hyg(max_magnitude: float = NAKED_EYE_LIMIT):
    """Yield HYG rows brighter than max_magnitude as plain dicts.

    The Sun (``mag=-26.7``) is excluded because we reconstruct the *night* sky
    and its fixed placeholder position (ra=0, dec=0) would produce wrong alt/az.
    """
    with open(HYG_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                mag = float(row["mag"])
            except (TypeError, ValueError):
                continue
            if mag >= max_magnitude:
                continue
            # Exclude the Sun — its magnitude is unrealistically bright and
            # its ra/dec are placeholder values, not actual ephemeris positions.
            if (row.get("proper") or "").strip() == "Sol":
                continue
            yield row


def compute_sky(date: str, time: str, latitude: float, longitude: float) -> dict:
    """Compute the visible sky for a birth moment.

    Returns a dict with:
      - timestamp_utc, latitude, longitude (metadata)
      - star_positions: list of {name, ra, dec, magnitude, spectral_class, x, y, z}
        for every star above the horizon (alt > 0) with mag < 6.5.
    """
    from skyfield.api import Star, wgs84, load

    year, month, day = map(int, date.split("-"))
    hour, minute = map(int, time.split(":"))

    ts = load.timescale()
    t = ts.utc(year, month, day, hour, minute)

    ephemeris = load("de421.bsp")
    earth = ephemeris["earth"]
    observer = (earth + wgs84.latlon(latitude, longitude, elevation_m=0)).at(t)

    star_positions: list[dict] = []
    for row in _iter_hyg():
        try:
            ra_h = float(row["ra"])
            dec_d = float(row["dec"])
            mag = float(row["mag"])
        except (TypeError, ValueError):
            continue

        star = Star(ra_hours=ra_h, dec_degrees=dec_d)
        alt, _az, _dist = observer.observe(star).apparent().altaz()
        if alt.degrees <= 0:
            continue

        x, y, z = _ra_dec_to_unit_vec(ra_h, dec_d)
        proper = (row.get("proper") or "").strip()
        hip = (row.get("hip") or "").strip()
        name = proper or (f"HIP{hip}" if hip else f"id{row.get('id', '?')}")

        star_positions.append({
            "name": name,
            "ra": ra_h,
            "dec": dec_d,
            "magnitude": mag,
            "spectral_class": _parse_spectral(row.get("spect", "")),
            "x": x,
            "y": y,
            "z": z,
        })

    return {
        "timestamp_utc": datetime(year, month, day, hour, minute, tzinfo=timezone.utc).isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "star_positions": star_positions,
    }
