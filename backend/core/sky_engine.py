"""Skyfield-based sky calculations."""

from datetime import datetime, timezone


def compute_sky(date: str, time: str, latitude: float, longitude: float) -> dict:
    """Compute the visible sky and planetary positions for a birth moment.

    Stub: returns metadata. Replace with skyfield calls (e.g. ``wgs84.latlon``,
    ``planetary positions``, ``Star`` lookups) when wiring the real engine.
    """
    dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
    return {
        "timestamp_utc": dt.isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "planets": {},
        "stars": [],
    }
