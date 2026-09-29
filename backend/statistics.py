"""Golf statistics and handicap-estimate calculations.

These are pure functions: they receive rounds and return results without
reading a database or changing global state.  That makes them straightforward
to understand and test.
"""

from statistics import mean
from math import floor
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
    return floor(differential * 10 + 0.5) / 10


def handicap_estimate(rounds: list[CompletedRound]) -> dict[str, Any]:
    """Return an unofficial handicap estimate from up to 20 recent rounds."""

    recent_rounds = sorted(
        rounds, key=lambda item: item.completed_at, reverse=True
    )[:20]
    differentials = []
    for round_data in recent_rounds:
        differential = estimated_differential(round_data)
        if differential is not None:
            differentials.append(differential)
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

    # Match JavaScript's rounding so online and offline estimates agree.
    average = mean(differentials[:used]) + adjustment
    value = min(54, floor(average * 10 + 0.5) / 10)
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


def dashboard_statistics(rounds: list[CompletedRound]) -> dict[str, Any]:
    """Return the same field names used by the browser's statistics view.

    Keep nine-hole and eighteen-hole averages separate: averaging a 36 with
    a 72 would otherwise produce a misleading score of 54.
    """
    lengths = {}
    hole_types = {par: {"strokes": 0, "holes": 0} for par in (3, 4, 5)}
    hits = 0
    opportunities = 0
    for round_data in rounds:
        count = len(round_data.holes)
        if count not in lengths:
            lengths[count] = {
                "rounds": 0, "totalScore": 0, "scoreToPar": 0,
                "totalPutts": 0, "totalPenalties": 0,
            }
        group = lengths[count]
        group["rounds"] += 1
        group["totalScore"] += round_data.total_score
        group["scoreToPar"] += round_data.score_to_par
        group["totalPutts"] += round_data.total_putts
        group["totalPenalties"] += round_data.total_penalties
        hits += round_data.fairways_hit
        opportunities += round_data.fairway_opportunities
        for hole in round_data.holes:
            if hole.par in hole_types:
                hole_types[hole.par]["strokes"] += hole.score
                hole_types[hole.par]["holes"] += 1

    # Compare strokes over par per hole so different round lengths are fair.
    best = min(
        rounds,
        key=lambda item: (item.score_to_par / len(item.holes), item.total_score),
        default=None,
    )
    return {
        "totalRounds": len(rounds),
        "roundLengths": lengths,
        "holeTypes": hole_types,
        "fairwayPercentage": floor(hits / opportunities * 100 + 0.5)
        if opportunities else 0,
        "bestRound": best.as_browser_json() if best else None,
        "handicap": handicap_estimate(rounds),
    }
