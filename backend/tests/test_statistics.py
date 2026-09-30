import unittest

from backend.models import CompletedRound
from backend.statistics import (
    estimated_differential, handicap_estimate, round_summary,
    dashboard_statistics, find_best_round,
)
from pydantic import ValidationError


def make_even_par_round(round_number: int) -> CompletedRound:
    """Create a small valid scorecard for a test."""

    holes = []
    for hole_number, par in enumerate([4, 3, 5, 4, 4, 3, 5, 4, 4], start=1):
        holes.append(
            {
                "number": hole_number,
                "par": par,
                "yardage": 350,
                "score": par,
                "putts": 2,
                "fairway": None if par == 3 else "hit",
                "penalties": 0,
            }
        )

    return CompletedRound.model_validate(
        {
            "id": f"round-{round_number}",
            "completedAt": f"2026-09-{round_number:02d}T12:00:00Z",
            "courseName": "Practice Course",
            "totalScore": 36,
            "totalPar": 36,
            "scoreToPar": 0,
            "totalPutts": 18,
            "totalPenalties": 0,
            "fairwaysHit": 7,
            "fairwayOpportunities": 7,
            "fairwayPercentage": 100,
            "holes": holes,
        }
    )


class StatisticsTests(unittest.TestCase):
    def test_best_round_compares_per_hole_before_total(self) -> None:
        nine = make_even_par_round(1)
        nine.score_to_par = 9
        nine.total_score = 45
        eighteen = make_even_par_round(2)
        eighteen.holes = eighteen.holes * 2
        eighteen.score_to_par = 10
        eighteen.total_score = 82
        self.assertIs(find_best_round([nine, eighteen]), eighteen)

    def test_best_round_ties_use_total_then_original_order(self) -> None:
        nine = make_even_par_round(1)
        another_nine = make_even_par_round(2)
        eighteen = make_even_par_round(3)
        eighteen.holes = eighteen.holes * 2
        eighteen.total_score = 72
        self.assertIs(find_best_round([eighteen, nine, another_nine]), nine)
        self.assertIsNone(find_best_round([]))

    def test_par_three_only_round_has_no_fairway_opportunities(self) -> None:
        data = make_even_par_round(1).as_browser_json()
        data["holes"] = [data["holes"][1]]
        data["holes"][0]["fairway"] = "hit"
        round_data = CompletedRound.model_validate(data)
        self.assertEqual(round_data.fairway_opportunities, 0)
        self.assertEqual(round_data.fairways_hit, 0)
        self.assertEqual(round_data.fairway_percentage, 0)
        self.assertEqual(dashboard_statistics([round_data])["fairwayPercentage"], 0)
        self.assertEqual(round_summary([round_data])["fairwayPercentage"], 0)

    def test_totals_count_putts_penalties_and_missed_fairways(self) -> None:
        data = make_even_par_round(1).as_browser_json()
        data["holes"][0]["score"] = 6
        data["holes"][0]["putts"] = 3
        data["holes"][0]["penalties"] = 1
        data["holes"][0]["fairway"] = "left"
        result = CompletedRound.model_validate(data)
        self.assertEqual(result.total_score, 38)
        self.assertEqual(result.total_putts, 19)
        self.assertEqual(result.total_penalties, 1)
        self.assertEqual(result.fairways_hit, 6)
        self.assertEqual(result.fairway_percentage, 86)
        # Validation is repeatable and does not accumulate a second time.
        repeated = CompletedRound.model_validate(result.as_browser_json())
        self.assertEqual(repeated.as_browser_json(), result.as_browser_json())

    def test_handicap_uses_newest_twenty_without_reordering_input(self) -> None:
        rounds = []
        for number in range(1, 22):
            round_data = make_even_par_round(number)
            round_data.total_score = 45
            rounds.append(round_data)
        rounds[0].total_score = 1  # Oldest result must be excluded.
        original_order = list(rounds)
        result = handicap_estimate(rounds)
        self.assertEqual(result["differentialCount"], 20)
        self.assertEqual(result["usedDifferentials"], 8)
        self.assertEqual(result["value"], 18.0)
        self.assertEqual(rounds, original_order)

    def test_rated_eighteen_uses_rating_and_slope(self) -> None:
        round_data = make_even_par_round(1)
        round_data.holes = round_data.holes * 2
        round_data.total_score = 90
        round_data.course_rating = 72
        round_data.slope_rating = 113
        self.assertEqual(estimated_differential(round_data), 18.0)

    def test_edited_hole_recalculates_stale_totals(self) -> None:
        data = make_even_par_round(1).as_browser_json()
        data["holes"][0]["score"] = 6
        corrected = CompletedRound.model_validate(data)
        self.assertEqual(corrected.total_score, 38)
        self.assertEqual(corrected.score_to_par, 2)

    def test_empty_dashboard_has_no_best_round(self) -> None:
        self.assertIsNone(dashboard_statistics([])["bestRound"])

    def test_dashboard_separates_round_lengths(self) -> None:
        nine = make_even_par_round(1)
        eighteen = make_even_par_round(2)
        eighteen.holes = eighteen.holes * 2
        eighteen.total_score = 72
        eighteen.total_par = 72
        result = dashboard_statistics([nine, eighteen])
        self.assertEqual(result["roundLengths"][9]["totalScore"], 36)
        self.assertEqual(result["roundLengths"][18]["totalScore"], 72)
        self.assertEqual(result["holeTypes"][3]["holes"], 6)

    def test_empty_scorecard_is_rejected(self) -> None:
        data = make_even_par_round(1).as_browser_json()
        data["holes"] = []
        with self.assertRaises(ValidationError):
            CompletedRound.model_validate(data)

    def test_even_par_nine_has_zero_differential(self) -> None:
        self.assertEqual(estimated_differential(make_even_par_round(1)), 0.0)

    def test_three_even_rounds_get_initial_adjustment(self) -> None:
        rounds = [make_even_par_round(number) for number in range(1, 4)]
        result = handicap_estimate(rounds)
        self.assertEqual(result["value"], -2.0)
        self.assertEqual(result["usedDifferentials"], 1)

    def test_summary_combines_rounds(self) -> None:
        rounds = [make_even_par_round(1), make_even_par_round(2)]
        result = round_summary(rounds)
        self.assertEqual(result["roundCount"], 2)
        self.assertEqual(result["averageScore"], 36.0)
        self.assertEqual(result["fairwayPercentage"], 100)


if __name__ == "__main__":
    unittest.main()
