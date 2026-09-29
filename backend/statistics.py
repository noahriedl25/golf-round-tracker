"""Golf statistics and handicap-estimate calculations.

These are pure functions: they receive rounds and return results without
reading a database or changing global state.  That makes them straightforward
to understand and test.
"""

from statistics import mean
from typing import Any

from .models import CompletedRound


def estimated_differential(round_data: CompletedRound) -> float | None:
    """Calculate one unofficial score differential.

    Rated 18-hole rounds use course and slope ratings.  Other rounds use par
    and a neutral slope of 113, matching the approximation in the web app.
    """

    hole_count = len(round_data.holes)
    if hole_count == 0:
        return None

    hole_factor = 18 / hole_count
    is_rated_eighteen = (
        hole_count == 18
        and round_data.course_rating is not None
        and round_data.slope_rating is not None
        and round_data.slope_rating > 0
    )

    adjusted_score = round_data.total_score * hole_factor
    course_rating = (
        round_data.course_rating
        if is_rated_eighteen
        else round_data.total_par * hole_factor
    )
    slope_rating = round_data.slope_rating if is_rated_eighteen else 113
    differential = (113 / slope_rating) * (adjusted_score - course_rating)
    return round(differential, 1)


def handicap_estimate(rounds: list[CompletedRound]) -> dict[str, Any]:
    """Return an unofficial handicap estimate from up to 20 recent rounds."""

    recent_rounds = sorted(
        rounds, key=lambda item: item.completed_at, reverse=True
    )[:20]
    differentials = [
        differential
        for round_data in recent_rounds
        if (differential := estimated_differential(round_data)) is not None
    ]
    differentials.sort()
    count = len(differentials)

    if count < 3:
        return {"value": None, "differentialCount": count, "usedDifferentials": 0}

    # World Handicap System table for players with fewer than 20 scores.
    if count == 3:
        used, adjustment = 1, -2
    elif count == 4:
        used, adjustment = 1, -1
    elif count == 5:
        used, adjustment = 1, 0
    elif count == 6:
        used, adjustment = 2, -1
    elif count <= 8:
        used, adjustment = 2, 0
    elif count <= 11:
        used, adjustment = 3, 0
    elif count <= 14:
        used, adjustment = 4, 0
    elif count <= 16:
        used, adjustment = 5, 0
    elif count <= 18:
        used, adjustment = 6, 0
    elif count == 19:
        used, adjustment = 7, 0
    else:
        used, adjustment = 8, 0

    value = min(54, round(mean(differentials[:used]) + adjustment, 1))
    return {"value": value, "differentialCount": count, "usedDifferentials": used}


def round_summary(rounds: list[CompletedRound]) -> dict[str, Any]:
    """Build the main career statistics shown by the application."""

    if not rounds:
        return {
            "roundCount": 0,
            "averageScore": None,
            "averageToPar": None,
            "averagePutts": None,
            "fairwayPercentage": None,
            "penaltiesPerRound": None,
            "handicap": handicap_estimate([]),
        }

    fairways_hit = sum(round_data.fairways_hit for round_data in rounds)
    opportunities = sum(
        round_data.fairway_opportunities for round_data in rounds
    )
    fairway_percentage = (
        round((fairways_hit / opportunities) * 100) if opportunities else 0
    )

    return {
        "roundCount": len(rounds),
        "averageScore": round(mean(item.total_score for item in rounds), 1),
        "averageToPar": round(mean(item.score_to_par for item in rounds), 1),
        "averagePutts": round(mean(item.total_putts for item in rounds), 1),
        "fairwayPercentage": fairway_percentage,
        "penaltiesPerRound": round(
            mean(item.total_penalties for item in rounds), 1
        ),
        "handicap": handicap_estimate(rounds),
    }
