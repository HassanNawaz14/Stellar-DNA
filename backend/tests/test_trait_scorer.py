"""Tests for core.trait_scorer — 5 deterministic scoring functions."""

from core.trait_scorer import (
    compute_energy_score,
    compute_pace_score,
    compute_legacy_score,
    compute_sky_diversity,
    compute_curiosity_type,
    compute_temporal_score,
    score_all,
)

# ─── Fixtures ──────────────────────────────────────────────────────────────────

ALL_M = {"O": 0.0, "B": 0.0, "A": 0.0, "F": 0.0, "G": 0.0, "K": 0.0, "M": 1.0}
ALL_O = {"O": 1.0, "B": 0.0, "A": 0.0, "F": 0.0, "G": 0.0, "K": 0.0, "M": 0.0}
MIXED = {"O": 0.1, "B": 0.3, "A": 0.25, "F": 0.15, "G": 0.1, "K": 0.05, "M": 0.05}
UNIFORM = {"O": 1/7, "B": 1/7, "A": 1/7, "F": 1/7, "G": 1/7, "K": 1/7, "M": 1/7}
LOW_DIV = {"O": 0.0, "B": 0.0, "A": 0.0, "F": 0.0, "G": 0.98, "K": 0.01, "M": 0.01}
HIGH_DIV = {"O": 0.15, "B": 0.15, "A": 0.15, "F": 0.15, "G": 0.15, "K": 0.15, "M": 0.10}

CARBON_HEAVY = {"C": 0.50, "O": 0.20, "Fe": 0.10, "Ca": 0.05, "N": 0.10, "Mg": 0.02, "Si": 0.01, "S": 0.005, "Au": 0.003, "other": 0.012}
IRON_HEAVY = {"C": 0.10, "O": 0.10, "Fe": 0.45, "Ca": 0.20, "N": 0.03, "Mg": 0.03, "Si": 0.03, "S": 0.03, "Au": 0.001, "other": 0.009}
OXYGEN_HEAVY = {"C": 0.10, "O": 0.50, "Fe": 0.10, "Ca": 0.05, "N": 0.05, "Mg": 0.10, "Si": 0.05, "S": 0.03, "Au": 0.001, "other": 0.009}
GOLD_HIGH = {"C": 0.20, "O": 0.20, "Fe": 0.15, "Ca": 0.10, "N": 0.05, "Mg": 0.05, "Si": 0.05, "S": 0.02, "Au": 0.03, "other": 0.015}
GOLD_LOW = {"C": 0.35, "O": 0.24, "Fe": 0.17, "Ca": 0.09, "N": 0.08, "Mg": 0.035, "Si": 0.015, "S": 0.008, "Au": 0.003, "other": 0.009}


class TestEnergyScore:
    def test_all_m_gives_10(self):
        assert compute_energy_score(ALL_M) == 10

    def test_all_o_gives_98(self):
        assert compute_energy_score(ALL_O) == 98

    def test_mixed_weighted_average(self):
        result = compute_energy_score(MIXED)
        expected = round(
            0.1 * 98 + 0.3 * 85 + 0.25 * 68 + 0.15 * 55 + 0.1 * 40 + 0.05 * 25 + 0.05 * 10
        )
        assert result == expected

    def test_uniform_is_roughly_mid(self):
        result = compute_energy_score(UNIFORM)
        assert 40 <= result <= 60

    def test_clamps_at_100(self):
        high = {k: 100.0 for k in ["O", "B", "A", "F", "G", "K", "M"]}
        result = compute_energy_score(high)
        assert result <= 100


class TestPaceScore:
    def test_all_m_winter(self):
        assert compute_pace_score(ALL_M, "winter") == max(0, round(5 - 8))

    def test_all_o_summer(self):
        assert compute_pace_score(ALL_O, "summer") == min(100, round(95 + 10))

    def test_mixed_autumn(self):
        result = compute_pace_score(MIXED, "autumn")
        base = 0.1*95 + 0.3*80 + 0.25*65 + 0.15*50 + 0.1*35 + 0.05*20 + 0.05*5
        expected = max(0, min(100, round(base - 3)))
        assert result == expected

    def test_season_modifier_applied(self):
        summer = compute_pace_score(ALL_M, "summer")
        winter = compute_pace_score(ALL_M, "winter")
        assert summer > winter

    def test_unknown_season_defaults_to_zero_modifier(self):
        result = compute_pace_score(ALL_G := {"O": 0, "B": 0, "A": 0, "F": 0, "G": 1, "K": 0, "M": 0}, "unknown")
        assert result == 35


class TestLegacyScore:
    def test_big_bang_is_15(self):
        assert compute_legacy_score("big_bang") == 15

    def test_agb_winds_is_35(self):
        assert compute_legacy_score("agb_winds") == 35

    def test_type_ii_sn_is_65(self):
        assert compute_legacy_score("type_ii_sn") == 65

    def test_type_ia_sn_is_80(self):
        assert compute_legacy_score("type_ia_sn") == 80

    def test_r_process_is_95(self):
        assert compute_legacy_score("r_process") == 95

    def test_unknown_path_defaults_to_50(self):
        assert compute_legacy_score("unknown_path") == 50


class TestSkyDiversity:
    def test_all_m_is_1(self):
        assert compute_sky_diversity(ALL_M) == 1

    def test_uniform_is_7(self):
        assert compute_sky_diversity(UNIFORM) == 7

    def test_low_diversity(self):
        assert compute_sky_diversity(LOW_DIV) == 1

    def test_high_diversity(self):
        assert compute_sky_diversity(HIGH_DIV) == 7

    def test_mixed_is_5(self):
        assert compute_sky_diversity(MIXED) == 5


class TestCuriosityType:
    def test_gold_above_threshold_is_deep(self):
        assert compute_curiosity_type(GOLD_HIGH, MIXED) == "Deep"

    def test_carbon_dominant_high_diversity_is_structural(self):
        assert compute_curiosity_type(CARBON_HEAVY, HIGH_DIV) == "Structural"

    def test_iron_dominant_low_diversity_is_elemental(self):
        assert compute_curiosity_type(IRON_HEAVY, LOW_DIV) == "Elemental"

    def test_oxygen_dominant_high_diversity_is_expansive(self):
        assert compute_curiosity_type(OXYGEN_HEAVY, HIGH_DIV) == "Expansive"

    def test_iron_dominant_high_diversity_defaults_to_expansive(self):
        assert compute_curiosity_type(IRON_HEAVY, HIGH_DIV) == "Expansive"

    def test_gold_below_threshold_does_not_trigger_deep(self):
        result = compute_curiosity_type(GOLD_LOW, MIXED)
        assert result != "Deep"


class TestTemporalScore:
    def test_all_carbon_gives_expected(self):
        only_carbon = {"C": 1.0}
        score = compute_temporal_score(only_carbon)
        expected = round(((6.0 - 2.0) / (13.5 - 2.0)) * 100)
        assert score == expected

    def test_max_age_is_100(self):
        old = {"C": 1.0}
        score = compute_temporal_score(old)
        assert score <= 100

    def test_min_age_is_0(self):
        young = {"Fe": 1.0}
        score = compute_temporal_score(young)
        assert score >= 0

    def test_mixed_elements_average(self):
        result = compute_temporal_score(CARBON_HEAVY)
        assert 0 <= result <= 100

    def test_includes_other_with_default_age(self):
        result = compute_temporal_score({"other": 1.0})
        expected = round(((5.0 - 2.0) / (13.5 - 2.0)) * 100)
        assert result == expected


class TestScoreAll:
    def test_returns_all_five_keys(self):
        result = score_all(MIXED, "summer", "type_ii_sn", CARBON_HEAVY)
        expected_keys = {"energy_score", "pace_score", "legacy_score", "curiosity_type", "temporal_score"}
        assert set(result.keys()) == expected_keys

    def test_all_values_have_correct_types(self):
        result = score_all(MIXED, "summer", "type_ii_sn", CARBON_HEAVY)
        assert isinstance(result["energy_score"], int)
        assert isinstance(result["pace_score"], int)
        assert isinstance(result["legacy_score"], int)
        assert isinstance(result["curiosity_type"], str)
        assert isinstance(result["temporal_score"], int)

    def test_deterministic_same_input_same_output(self):
        r1 = score_all(MIXED, "spring", "agb_winds", CARBON_HEAVY)
        r2 = score_all(MIXED, "spring", "agb_winds", CARBON_HEAVY)
        assert r1 == r2
