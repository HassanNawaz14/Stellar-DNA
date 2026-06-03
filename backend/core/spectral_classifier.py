"""HYG-database spectral classification."""

from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "hyg_database.csv"


def classify_stars(sky: dict) -> list[dict]:
    """Tag each star in the sky with a spectral class weight.

    The HYG database is loaded once and indexed by ``id``. The stub returns
    whatever stars are present in ``sky`` unchanged; replace with a real
    lookup + spectral weight table.
    """
    if not DATA_PATH.exists():
        return sky.get("stars", [])
    return sky.get("stars", [])
