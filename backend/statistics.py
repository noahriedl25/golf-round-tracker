"""Golf statistics and handicap-estimate calculations.

These are pure functions: they receive rounds and return results without
reading a database or changing global state.  That makes them straightforward
to understand and test.
"""

from statistics import mean
from math import floor
from typing import Any

from .models import CompletedRound


def completion_date(round_data: CompletedRound) -> str:
    """Provide the stored timestamp used by sorted(), like a Java sort key."""
    return round_data.completed_at


def find_best_round(rounds: list[CompletedRound]) -> CompletedRound | None:
    """Compare strokes over par per hole, then total score to break ties."""
    best = None
    for candidate in rounds:
        if best is None:
            best = candidate
            continue

        candidate_average = candidate.score_to_par / len(candidate.holes)
        best_average = best.score_to_par / len(best.holes)
        if candidate_average < best_average:
            best = candidate
        elif candidate_average == best_average:
            if candidate.total_score < best.total_score:
                best = candidate

    # An empty list returns None. Exact ties keep the first round encountered.
    return best


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
    if is_rated_eighteen:
        course_rating = round_data.course_rating
        slope_rating = round_data.slope_rating
    else:
        course_rating = round_data.total_par * hole_factor
        slope_rating = 113
    differential = (113 / slope_rating) * (adjusted_score - course_rating)
    return floor(differential * 10 + 0.5) / 10


def handicap_estimate(rounds: list[CompletedRound]) -> dict[str, Any]:
    """Return an unofficial handicap estimate from up to 20 recent rounds."""

    # Sort a copy; do not rearrange the caller's history list.
    newest_first = sorted(rounds, key=completion_date, reverse=True)
    recent_rounds = newest_first[:20]
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
    """Build the simple API summary; the UI uses dashboard_statistics instead."""

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

    total_score = 0
    total_to_par = 0
    total_putts = 0
    total_penalties = 0
    fairways_hit = 0
    opportunities = 0
    for round_data in rounds:
        total_score += round_data.total_score
        total_to_par += round_data.score_to_par
        total_putts += round_data.total_putts
        total_penalties += round_data.total_penalties
        fairways_hit += round_data.fairways_hit
        opportunities += round_data.fairway_opportunities

    fairway_percentage = 0
    if opportunities > 0:
        fairway_percentage = round(fairways_hit / opportunities * 100)
    round_count = len(rounds)

    return {
        "roundCount": round_count,
        "averageScore": round(total_score / round_count, 1),
        "averageToPar": round(total_to_par / round_count, 1),
        "averagePutts": round(total_putts / round_count, 1),
        "fairwayPercentage": fairway_percentage,
        "penaltiesPerRound": round(total_penalties / round_count, 1),
        "handicap": handicap_estimate(rounds),
    }


def dashboard_statistics(rounds: list[CompletedRound]) -> dict[str, Any]:
    """Return the same field names used by the browser's statistics view.

    Keep nine-hole and eighteen-hole averages separate: averaging a 36 with
    a 72 would otherwise produce a misleading score of 54.
    """
    lengths = {}
    hole_types = {}
    for par in (3, 4, 5):
        hole_types[par] = {"strokes": 0, "holes": 0}
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
    best = find_best_round(rounds)
    best_json = None
    if best is not None:
        best_json = best.as_browser_json()

    fairway_percentage = 0
    if opportunities > 0:
        fairway_percentage = floor(hits / opportunities * 100 + 0.5)
    return {
        "totalRounds": len(rounds),
        "roundLengths": lengths,
        "holeTypes": hole_types,
        "fairwayPercentage": fairway_percentage,
        "bestRound": best_json,
        "handicap": handicap_estimate(rounds),
    }
