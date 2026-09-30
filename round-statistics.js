// Pure calculations: no DOM, storage, network, or framework dependencies.
// Loaded before script.js, like model logic used by a JavaFX controller.

function calculateCompletedRoundTotals(holes) {
    // Offline total calculation; Python validates these totals again on receipt.
    const totals = {
        totalScore: 0,
        totalPar: 0,
        totalPutts: 0,
        totalPenalties: 0,
        fairwaysHit: 0,
        fairwayOpportunities: 0
    };

    for (const hole of holes) {
        totals.totalScore += hole.score;
        totals.totalPar += hole.par;
        totals.totalPutts += hole.putts;
        totals.totalPenalties += hole.penalties;

        if (hole.par !== 3) {
            totals.fairwayOpportunities++;

            if (hole.fairway === "hit") {
                totals.fairwaysHit++;
            }
        }

    }

    totals.scoreToPar = totals.totalScore - totals.totalPar;
    totals.fairwayPercentage = 0;
    if (totals.fairwayOpportunities > 0) {
        totals.fairwayPercentage = Math.round(
            totals.fairwaysHit / totals.fairwayOpportunities * 100
        );
    }
    return totals;
}

function calculateHandicapEstimate(history) {
    // History arrives newest first. Do not change the caller's array.
    const recentRounds = history.slice(0, 20);
    const differentials = [];
    for (const round of recentRounds) {
        const differential = calculateEstimatedDifferential(round);
        if (Number.isFinite(differential)) {
            differentials.push(differential);
        }
    }
    differentials.sort(compareNumbers);
    const count = differentials.length;

    if (count < 3) {
        return {
            value: null,
            differentialCount: count,
            usedDifferentials: 0
        };
    }

    let usedDifferentials;
    let adjustment = 0;

    if (count === 3) {
        usedDifferentials = 1;
        adjustment = -2;
    } else if (count === 4) {
        usedDifferentials = 1;
        adjustment = -1;
    } else if (count === 5) {
        usedDifferentials = 1;
    } else if (count === 6) {
        usedDifferentials = 2;
        adjustment = -1;
    } else if (count <= 8) {
        usedDifferentials = 2;
    } else if (count <= 11) {
        usedDifferentials = 3;
    } else if (count <= 14) {
        usedDifferentials = 4;
    } else if (count <= 16) {
        usedDifferentials = 5;
    } else if (count <= 18) {
        usedDifferentials = 6;
    } else if (count === 19) {
        usedDifferentials = 7;
    } else {
        usedDifferentials = 8;
    }

    let total = 0;
    for (let index = 0; index < usedDifferentials; index++) {
        total += differentials[index];
    }
    const average = total / usedDifferentials;
    const value = Math.min(54, Math.round((average + adjustment) * 10) / 10);

    return {
        value: value,
        differentialCount: count,
        usedDifferentials: usedDifferentials
    };
}

function calculateEstimatedDifferential(round) {
    if (
        !Array.isArray(round.holes) ||
        round.holes.length === 0 ||
        !Number.isFinite(round.totalScore) ||
        !Number.isFinite(round.totalPar)
    ) {
        return null;
    }

    const holeFactor = 18 / round.holes.length;
    const isRatedEighteen =
        round.holes.length === 18 &&
        Number.isFinite(round.courseRating) &&
        Number.isFinite(round.slopeRating) &&
        round.slopeRating > 0;
    const adjustedScore = round.totalScore * holeFactor;
    let courseRating = round.totalPar * holeFactor;
    let slopeRating = 113;
    if (isRatedEighteen) {
        courseRating = round.courseRating;
        slopeRating = round.slopeRating;
    }
    const differential = (113 / slopeRating) * (adjustedScore - courseRating);

    return Math.round(differential * 10) / 10;
}

function calculateStatistics(history) {
    // Offline grouping mirrors Python's dashboard_statistics function.
    let totalScore = 0;
    let totalToPar = 0;
    let totalPutts = 0;
    let totalPenalties = 0;
    let fairwaysHit = 0;
    let fairwayOpportunities = 0;
    const roundLengths = {};
    const holeTypes = {
        3: { strokes: 0, holes: 0 },
        4: { strokes: 0, holes: 0 },
        5: { strokes: 0, holes: 0 }
    };

    for (const round of history) {
        const holeCount = round.holes.length;

        totalScore += round.totalScore;
        totalToPar += round.scoreToPar;
        totalPutts += round.totalPutts;
        totalPenalties += round.totalPenalties;
        fairwaysHit += round.fairwaysHit;
        fairwayOpportunities += round.fairwayOpportunities;

        if (roundLengths[holeCount] === undefined) {
            roundLengths[holeCount] = {
                rounds: 0,
                totalScore: 0,
                scoreToPar: 0,
                totalPutts: 0,
                totalPenalties: 0
            };
        }

        roundLengths[holeCount].rounds++;
        roundLengths[holeCount].totalScore += round.totalScore;
        roundLengths[holeCount].scoreToPar += round.scoreToPar;
        roundLengths[holeCount].totalPutts += round.totalPutts;
        roundLengths[holeCount].totalPenalties += round.totalPenalties;

        for (const hole of round.holes) {
            if (holeTypes[hole.par] !== undefined && Number.isFinite(hole.score)) {
                holeTypes[hole.par].strokes += hole.score;
                holeTypes[hole.par].holes++;
            }
        }
    }

    let bestRound = null;
    for (const round of history) {
        if (bestRound === null) {
            bestRound = round;
            continue;
        }
        const roundRate = round.scoreToPar / round.holes.length;
        const bestRate = bestRound.scoreToPar / bestRound.holes.length;

        if (roundRate < bestRate) {
            bestRound = round;
        }

        if (
            roundRate === bestRate &&
            round.totalScore < bestRound.totalScore
        ) {
            bestRound = round;
        }

    }

    let fairwayPercentage = 0;
    if (fairwayOpportunities > 0) {
        fairwayPercentage = Math.round(fairwaysHit / fairwayOpportunities * 100);
    }
    // The UI normally skips empty history. Make this pure function safe too.
    if (history.length === 0) {
        return {
            totalRounds: 0, averageScore: null, averageToPar: null,
            averagePutts: null, averagePenalties: null, fairwayPercentage: 0,
            bestRound: null, roundLengths: roundLengths, holeTypes: holeTypes
        };
    }

    return {
        totalRounds: history.length,
        averageScore: totalScore / history.length,
        averageToPar: totalToPar / history.length,
        averagePutts: totalPutts / history.length,
        averagePenalties: totalPenalties / history.length,
        fairwayPercentage: fairwayPercentage,
        bestRound: bestRound,
        roundLengths: roundLengths,
        holeTypes: holeTypes
    };
}

function compareNumbers(first, second) {
    // JavaScript's default sort is textual; subtraction requests numeric order.
    return first - second;
}

