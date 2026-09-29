import unittest

from backend.models import CompletedRound
from backend.statistics import estimated_differential, handicap_estimate, round_summary


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
