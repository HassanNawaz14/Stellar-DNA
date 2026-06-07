"""Chronobiology: birth season + hemisphere classification.

Uses meteorological seasons (not astronomical) per the Part 1 spec:
  Dec/Jan/Feb = winter, Mar/Apr/May = spring, Jun/Jul/Aug = summer,
  Sep/Oct/Nov = autumn. The southern hemisphere is the northern one flipped.
"""

from datetime import datetime

NORTHERN_SEASONS_BY_MONTH: dict[int, str] = {
    12: "winter", 1: "winter", 2: "winter",
    3: "spring",  4: "spring", 5: "spring",
    6: "summer",  7: "summer", 8: "summer",
    9: "autumn", 10: "autumn", 11: "autumn",
}

SOUTHERN_FLIP: dict[str, str] = {
    "winter": "summer",
    "summer": "winter",
    "spring": "autumn",
    "autumn": "spring",
}


def season_and_hemisphere(date: str, latitude: float) -> dict:
    """Return hemisphere + season for a given birth date and latitude."""
    dt = datetime.strptime(date, "%Y-%m-%d")
    hemisphere = "northern" if latitude >= 0 else "southern"
    season = NORTHERN_SEASONS_BY_MONTH[dt.month]
    if hemisphere == "southern":
        season = SOUTHERN_FLIP[season]
    return {
        "hemisphere": hemisphere,
        "season": season,
        "month": dt.month,
    }
