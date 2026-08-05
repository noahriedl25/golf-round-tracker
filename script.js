const setupSection = document.getElementById("setup-section");
const roundSection = document.getElementById("round-section");
const historySection = document.getElementById("history-section");

const courseSelect = document.getElementById("course-select");
const startRoundButton = document.getElementById("start-round-button");
const resumeRoundButton = document.getElementById("resume-round-button");
const historyButton = document.getElementById("history-button");
const historyBackButton = document.getElementById("history-back-button");
const historyCountText = document.getElementById("history-count");
const emptyHistoryMessage = document.getElementById("empty-history-message");
const historyList = document.getElementById("history-list");

const holeNumberText = document.getElementById("hole-number");
const holeParText = document.getElementById("hole-par");
const holeYardageText = document.getElementById("hole-yardage");
const currentScoreText = document.getElementById("current-score");

const scoreInput = document.getElementById("score-input");
const puttsInput = document.getElementById("putts-input");
const fairwayInput = document.getElementById("fairway-input");
const penaltiesInput = document.getElementById("penalties-input");

const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const messageText = document.getElementById("message");

const holeProgressText =
    document.getElementById("hole-progress");

const courseNameText =
    document.getElementById("course-name");

const progressBar = document.getElementById("progress-bar");

const fairwayGroup = document.getElementById("fairway-group");

const scoreMinusButton = document.getElementById("score-minus-button");

const scorePlusButton = document.getElementById("score-plus-button");

const puttsMinusButton = document.getElementById("putts-minus-button");

const puttsPlusButton = document.getElementById("putts-plus-button");

const penaltiesMinusButton = document.getElementById("penalties-minus-button");

const penaltiesPlusButton = document.getElementById("penalties-plus-button");

const ACTIVE_ROUND_KEY = "golfTrackerActiveRound";
const ROUND_HISTORY_KEY = "golfTrackerRoundHistory";



const courses = {
    standard: {
        name: "Standard Par 72 Course",

        holes: [
            { number: 1, par: 4, yardage: 375 },
            { number: 2, par: 4, yardage: 390 },
            { number: 3, par: 3, yardage: 165 },
            { number: 4, par: 5, yardage: 510 },
            { number: 5, par: 4, yardage: 405 },
            { number: 6, par: 4, yardage: 360 },
            { number: 7, par: 3, yardage: 175 },
            { number: 8, par: 5, yardage: 525 },
            { number: 9, par: 4, yardage: 385 },
            { number: 10, par: 4, yardage: 400 },
            { number: 11, par: 3, yardage: 155 },
            { number: 12, par: 4, yardage: 370 },
            { number: 13, par: 5, yardage: 535 },
            { number: 14, par: 4, yardage: 395 },
            { number: 15, par: 4, yardage: 380 },
            { number: 16, par: 3, yardage: 170 },
            { number: 17, par: 5, yardage: 520 },
            { number: 18, par: 4, yardage: 410 }
        ]
    },

    practice: {
        name: "Practice Course",

        holes: [
            { number: 1, par: 4, yardage: 340 },
            { number: 2, par: 3, yardage: 145 },
            { number: 3, par: 5, yardage: 480 },
            { number: 4, par: 4, yardage: 355 },
            { number: 5, par: 4, yardage: 365 },
            { number: 6, par: 3, yardage: 150 },
            { number: 7, par: 5, yardage: 495 },
            { number: 8, par: 4, yardage: 350 },
            { number: 9, par: 4, yardage: 370 }
        ]
    }
};

let selectedCourse = null;
let currentHoleIndex = 0;
let roundResults = [];

startRoundButton.addEventListener("click", startRound);
previousButton.addEventListener("click", goToPreviousHole);
nextButton.addEventListener("click", saveHoleAndContinue);
resumeRoundButton.addEventListener("click", resumeSavedRound);
historyButton.addEventListener("click", showRoundHistory);
historyBackButton.addEventListener("click", showSetup);

scoreInput.addEventListener("change", saveInputProgress);
puttsInput.addEventListener("change", saveInputProgress);
fairwayInput.addEventListener("change", saveInputProgress);
penaltiesInput.addEventListener("change", saveInputProgress);

checkForSavedRound();

scoreMinusButton.addEventListener("click", function () {
    changeNumberInput(scoreInput, -1, 1);
});

scorePlusButton.addEventListener("click", function () {
    changeNumberInput(scoreInput, 1, 1);
});

puttsMinusButton.addEventListener("click", function () {
    changeNumberInput(puttsInput, -1, 0);
});

puttsPlusButton.addEventListener("click", function () {
    changeNumberInput(puttsInput, 1, 0);
});

penaltiesMinusButton.addEventListener("click", function () {
    changeNumberInput(penaltiesInput, -1, 0);
});

penaltiesPlusButton.addEventListener("click", function () {
    changeNumberInput(penaltiesInput, 1, 0);
});

function changeNumberInput(input, amount, minimum) {
    let currentValue = Number(input.value);

    if (input.value === "") {
        currentValue = minimum;
    }

    const newValue = currentValue + amount;

    if (newValue >= minimum) {
        input.value = newValue;
        saveInputProgress();
    }
}

function saveActiveRound() {
    if (selectedCourse === null) {
        return;
    }

    const activeRound = {
        courseId: courseSelect.value,
        currentHoleIndex: currentHoleIndex,
        roundResults: roundResults
    };

    localStorage.setItem(
        ACTIVE_ROUND_KEY,
        JSON.stringify(activeRound)
    );
}

function startRound() {
    localStorage.removeItem(ACTIVE_ROUND_KEY);

    const selectedCourseId = courseSelect.value;

    selectedCourse = courses[selectedCourseId];
    currentHoleIndex = 0;

    roundResults = selectedCourse.holes.map(function () {
        return {
            score: null,
            putts: null,
            fairway: "",
            penalties: 0
        };
    });

    setupSection.classList.add("hidden");
    roundSection.classList.remove("hidden");

    saveActiveRound();

    displayCurrentHole();
}

function displayCurrentHole() {
    const currentHole = selectedCourse.holes[currentHoleIndex];
    const currentResult = roundResults[currentHoleIndex];

    holeNumberText.textContent = currentHole.number;
    holeParText.textContent = currentHole.par;
    holeYardageText.textContent = currentHole.yardage;

    holeProgressText.textContent =
    `Hole ${currentHole.number} of ${selectedCourse.holes.length}`;

    courseNameText.textContent = selectedCourse.name;

    const progressPercentage =
        ((currentHoleIndex + 1) / selectedCourse.holes.length) * 100;

    progressBar.style.width = `${progressPercentage}%`;

    scoreInput.value = currentResult.score ?? currentHole.par;
    puttsInput.value = currentResult.putts ?? 2;
    fairwayInput.value = currentResult.fairway;
    penaltiesInput.value = currentResult.penalties;

    if (currentHole.par === 3) {
    fairwayGroup.classList.add("hidden");
    fairwayInput.value = "na";
    } else {
    fairwayGroup.classList.remove("hidden");
    }   

    previousButton.disabled = currentHoleIndex === 0;

    if (currentHoleIndex === selectedCourse.holes.length - 1) {
        nextButton.textContent = "Finish Round";
    } else {
        nextButton.textContent = "Save & Next";
    }

    messageText.textContent = "";

    updateCurrentScore();
}

function saveHoleAndContinue() {
    const score = Number(scoreInput.value);
    const putts = Number(puttsInput.value);
    const penalties = Number(penaltiesInput.value);
    const fairway = fairwayInput.value;

    if (scoreInput.value === "" || puttsInput.value === "") {
        messageText.textContent = "Enter a score and number of putts.";
        return;
    }

    const currentHole = selectedCourse.holes[currentHoleIndex];

    if (currentHole.par !== 3 && fairway === "") {
        messageText.textContent = "Select a fairway result.";
        return;
    }

    roundResults[currentHoleIndex] = {
        score: score,
        putts: putts,
        fairway: currentHole.par === 3 ? "na" : fairway,
        penalties: penalties
    };

    updateCurrentScore();

    if (currentHoleIndex === selectedCourse.holes.length - 1) {
        finishRound();
        return;
    }

    currentHoleIndex++;
    saveActiveRound();
    displayCurrentHole();
}
function saveCurrentHoleWithoutValidation() {
    const currentHole = selectedCourse.holes[currentHoleIndex];

    const score =
        scoreInput.value === ""
            ? null
            : Number(scoreInput.value);

    const putts =
        puttsInput.value === ""
            ? null
            : Number(puttsInput.value);

    roundResults[currentHoleIndex] = {
        score: score,
        putts: putts,
        fairway:
            currentHole.par === 3
                ? "na"
                : fairwayInput.value,
        penalties:
            penaltiesInput.value === ""
                ? 0
                : Number(penaltiesInput.value)
    };
}

function goToPreviousHole() {
    if (currentHoleIndex === 0) {
        return;
    }

    saveCurrentHoleWithoutValidation();

    currentHoleIndex--;
    saveActiveRound();
    displayCurrentHole();
}

function saveInputProgress() {
    if (selectedCourse === null) {
        return;
    }

    saveCurrentHoleWithoutValidation();
    saveActiveRound();
    updateCurrentScore();
}

function checkForSavedRound() {
    const savedRoundText =
        localStorage.getItem(ACTIVE_ROUND_KEY);

    if (savedRoundText !== null && getValidSavedRound(savedRoundText) !== null) {
        resumeRoundButton.classList.remove("hidden");
    }
}

function getValidSavedRound(savedRoundText) {
    try {
        const savedRound = JSON.parse(savedRoundText);
        const course = courses[savedRound.courseId];

        if (
            course === undefined ||
            !Number.isInteger(savedRound.currentHoleIndex) ||
            savedRound.currentHoleIndex < 0 ||
            savedRound.currentHoleIndex >= course.holes.length ||
            !Array.isArray(savedRound.roundResults) ||
            savedRound.roundResults.length !== course.holes.length
        ) {
            return null;
        }

        return savedRound;
    } catch {
        return null;
    }
}

function resumeSavedRound() {
    const savedRoundText =
        localStorage.getItem(ACTIVE_ROUND_KEY);

    if (savedRoundText === null) {
        return;
    }

    const savedRound = getValidSavedRound(savedRoundText);

    if (savedRound === null) {
        localStorage.removeItem(ACTIVE_ROUND_KEY);
        resumeRoundButton.classList.add("hidden");
        return;
    }

    selectedCourse = courses[savedRound.courseId];
    currentHoleIndex = savedRound.currentHoleIndex;
    roundResults = savedRound.roundResults;

    courseSelect.value = savedRound.courseId;

    setupSection.classList.add("hidden");
    roundSection.classList.remove("hidden");

    displayCurrentHole();
}

function getRoundHistory() {
    const savedHistoryText = localStorage.getItem(ROUND_HISTORY_KEY);

    if (savedHistoryText === null) {
        return [];
    }

    try {
        const savedHistory = JSON.parse(savedHistoryText);
        return Array.isArray(savedHistory)
            ? savedHistory.filter(isValidCompletedRound)
            : [];
    } catch {
        return [];
    }
}

function isValidCompletedRound(round) {
    return (
        round !== null &&
        typeof round === "object" &&
        typeof round.courseName === "string" &&
        typeof round.completedAt === "string" &&
        Number.isFinite(round.totalScore) &&
        Number.isFinite(round.scoreToPar) &&
        Number.isFinite(round.totalPutts) &&
        Number.isFinite(round.totalPenalties) &&
        Number.isFinite(round.fairwayPercentage) &&
        Array.isArray(round.holes)
    );
}

function saveCompletedRound(round) {
    const history = getRoundHistory();
    history.unshift(round);
    localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(history));
}

function showRoundHistory() {
    setupSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    historySection.classList.remove("hidden");
    renderRoundHistory();
}

function showSetup() {
    historySection.classList.add("hidden");
    roundSection.classList.add("hidden");
    setupSection.classList.remove("hidden");
}

function renderRoundHistory() {
    const history = getRoundHistory();

    historyList.replaceChildren();
    emptyHistoryMessage.classList.toggle("hidden", history.length !== 0);
    historyCountText.textContent =
        history.length === 1 ? "1 saved round" : `${history.length} saved rounds`;

    history.forEach(function (round) {
        historyList.append(createHistoryCard(round));
    });
}

function createHistoryCard(round) {
    const card = document.createElement("article");
    card.className = "history-card";

    const heading = document.createElement("div");
    heading.className = "history-card-heading";

    const courseDetails = document.createElement("div");
    const courseName = document.createElement("h3");
    const completedDate = document.createElement("p");
    courseName.textContent = round.courseName;
    completedDate.textContent = formatRoundDate(round.completedAt);
    courseDetails.append(courseName, completedDate);

    const score = document.createElement("div");
    const scoreTotal = document.createElement("strong");
    const scoreToPar = document.createElement("span");
    score.className = "history-score";
    scoreTotal.textContent = round.totalScore;
    scoreToPar.textContent = formatScoreToPar(round.scoreToPar);
    score.append(scoreTotal, scoreToPar);
    heading.append(courseDetails, score);

    const stats = document.createElement("div");
    stats.className = "history-stats";
    stats.append(
        createStat("Putts", round.totalPutts),
        createStat("Penalties", round.totalPenalties),
        createStat("Fairways", `${round.fairwayPercentage}%`)
    );

    const scorecard = document.createElement("details");
    const scorecardSummary = document.createElement("summary");
    scorecardSummary.textContent = "View scorecard";
    scorecard.append(scorecardSummary, createScorecard(round.holes));

    card.append(heading, stats, scorecard);
    return card;
}

function createStat(label, value) {
    const stat = document.createElement("div");
    const statLabel = document.createElement("span");
    const statValue = document.createElement("strong");
    statLabel.textContent = label;
    statValue.textContent = value;
    stat.append(statLabel, statValue);
    return stat;
}

function createScorecard(holes) {
    const wrapper = document.createElement("div");
    wrapper.className = "scorecard-wrapper";

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>Score</th>
                <th>Putts</th>
                <th>Fairway</th>
                <th>Pen.</th>
            </tr>
        </thead>
    `;

    const tableBody = document.createElement("tbody");

    holes.forEach(function (hole) {
        const row = document.createElement("tr");
        const values = [
            hole.number,
            hole.par,
            hole.score,
            hole.putts,
            formatFairway(hole.fairway),
            hole.penalties
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });

        tableBody.append(row);
    });

    table.append(tableBody);
    wrapper.append(table);
    return wrapper;
}

function formatRoundDate(dateText) {
    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function formatScoreToPar(scoreToPar) {
    if (scoreToPar === 0) {
        return "Even";
    }

    return scoreToPar > 0 ? `+${scoreToPar}` : String(scoreToPar);
}

function formatFairway(fairway) {
    const labels = {
        hit: "Hit",
        left: "Left",
        right: "Right",
        na: "—"
    };

    return labels[fairway] ?? "—";
}

function updateCurrentScore() {
    let totalScore = 0;
    let totalPar = 0;

    for (let index = 0; index < roundResults.length; index++) {
        const result = roundResults[index];

        if (result.score !== null) {
            totalScore += result.score;
            totalPar += selectedCourse.holes[index].par;
        }
    }

    const scoreDifference = totalScore - totalPar;

    if (totalPar === 0 || scoreDifference === 0) {
        currentScoreText.textContent = "Even";
    } else if (scoreDifference > 0) {
        currentScoreText.textContent = `+${scoreDifference}`;
    } else {
        currentScoreText.textContent = scoreDifference;
    }
}

function finishRound() {
    let totalScore = 0;
    let totalPar = 0;
    let totalPutts = 0;
    let totalPenalties = 0;
    let fairwaysHit = 0;
    let fairwayOpportunities = 0;

    for (let index = 0; index < roundResults.length; index++) {
        const result = roundResults[index];
        const hole = selectedCourse.holes[index];

        totalScore += result.score;
        totalPar += hole.par;
        totalPutts += result.putts;
        totalPenalties += result.penalties;

        if (hole.par !== 3) {
            fairwayOpportunities++;

            if (result.fairway === "hit") {
                fairwaysHit++;
            }
        }
    }

    const fairwayPercentage =
        fairwayOpportunities === 0
            ? 0
            : Math.round((fairwaysHit / fairwayOpportunities) * 100);

    const completedRound = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        completedAt: new Date().toISOString(),
        courseId: courseSelect.value,
        courseName: selectedCourse.name,
        totalScore: totalScore,
        totalPar: totalPar,
        scoreToPar: totalScore - totalPar,
        totalPutts: totalPutts,
        totalPenalties: totalPenalties,
        fairwaysHit: fairwaysHit,
        fairwayOpportunities: fairwayOpportunities,
        fairwayPercentage: fairwayPercentage,
        holes: selectedCourse.holes.map(function (hole, index) {
            return {
                number: hole.number,
                par: hole.par,
                yardage: hole.yardage,
                ...roundResults[index]
            };
        })
    };

    saveCompletedRound(completedRound);
    localStorage.removeItem(ACTIVE_ROUND_KEY);

    roundSection.innerHTML = `
        <h2>Round Complete</h2>

        <p>
            You shot <strong>${totalScore}</strong>
            (${formatScoreToPar(totalScore - totalPar)}).
        </p>

        <p>
            Total putts:
            <strong>${totalPutts}</strong>
        </p>

        <p>
            Penalty strokes:
            <strong>${totalPenalties}</strong>
        </p>

        <p>
            Fairways hit:
            <strong>
                ${fairwaysHit} of ${fairwayOpportunities}
                (${fairwayPercentage}%)
            </strong>
        </p>

        <button id="new-round-button" type="button">
            Start Another Round
        </button>

        <button
            id="summary-history-button"
            class="secondary-button"
            type="button"
        >
            View Round History
        </button>
    `;

    const newRoundButton =
        document.getElementById("new-round-button");
    const summaryHistoryButton =
        document.getElementById("summary-history-button");

    newRoundButton.addEventListener("click", function () {
        window.location.reload();
    });

    summaryHistoryButton.addEventListener("click", showRoundHistory);
}
