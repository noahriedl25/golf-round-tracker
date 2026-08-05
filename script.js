const setupSection = document.getElementById("setup-section");
const roundSection = document.getElementById("round-section");

const courseSelect = document.getElementById("course-select");
const startRoundButton = document.getElementById("start-round-button");

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

const progressBar =
    document.getElementById("progress-bar");

const fairwayGroup =
    document.getElementById("fairway-group");

const scoreMinusButton =
    document.getElementById("score-minus-button");

const scorePlusButton =
    document.getElementById("score-plus-button");

const puttsMinusButton =
    document.getElementById("putts-minus-button");

const puttsPlusButton =
    document.getElementById("putts-plus-button");

const penaltiesMinusButton =
    document.getElementById("penalties-minus-button");

const penaltiesPlusButton =
    document.getElementById("penalties-plus-button");

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
    }
}

function startRound() {
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
    displayCurrentHole();
}

function goToPreviousHole() {
    if (currentHoleIndex === 0) {
        return;
    }

    currentHoleIndex--;
    displayCurrentHole();
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
    let totalPutts = 0;
    let totalPenalties = 0;
    let fairwaysHit = 0;
    let fairwayOpportunities = 0;

    for (let index = 0; index < roundResults.length; index++) {
        const result = roundResults[index];
        const hole = selectedCourse.holes[index];

        totalScore += result.score;
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
        Math.round((fairwaysHit / fairwayOpportunities) * 100);

    roundSection.innerHTML = `
        <h2>Round Complete</h2>

        <p>
            You shot <strong>${totalScore}</strong>.
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
    `;

    const newRoundButton =
        document.getElementById("new-round-button");

    newRoundButton.addEventListener("click", function () {
        window.location.reload();
    });
}