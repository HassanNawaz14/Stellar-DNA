"""Chronobiology: birth season + hemisphere classification."""

from datetime import datetime

NORTHERN_SEASONS = {
    "spring": ((3, 20), (6, 20)),
    "summer": ((6, 21), (9, 22)),
    "autumn": ((9, 23), (12, 20)),
    "winter": ((12, 21), (3, 19)),
}


def _season(month: int, day: int) -> str:
    for name, ((sm, sd), (em, ed)) in NORTHERN_SEASONS.items():
        if (month, day) >= (sm, sd) and (month, day) <= (em, ed):
            return name
    return "winter"


def season_and_hemisphere(date: str, latitude: float) -> dict:
    """Return hemisphere + season for a given birth date and latitude."""
    dt = datetime.strptime(date, "%Y-%m-%d")
    hemisphere = "northern" if latitude >= 0 else "southern"
    season = _season(dt.month, dt.day)
    if hemisphere == "southern":
        opposite = {
            "spring": "autumn",
            "summer": "winter",
            "autumn": "spring",
            "winter": "summer",
        }
        season = opposite[season]
    return {
        "hemisphere": hemisphere,
        "season": season,
        "month": dt.month,
    }
