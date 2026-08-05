const holesContainer = document.getElementById("holes-container");
const calculateButton = document.getElementById("calculate-button");
const resultText = document.getElementById("result");

createHoleInputs();

calculateButton.addEventListener("click", calculateRound);

function createHoleInputs() {
    for (let holeNumber = 1; holeNumber <= 18; holeNumber++) {
        const holeDiv = document.createElement("div");
        holeDiv.classList.add("hole");

        holeDiv.innerHTML = `
            <h3>Hole ${holeNumber}</h3>

            <label for="par-${holeNumber}">Par</label>
            <input
                id="par-${holeNumber}"
                class="par-input"
                type="number"
                min="3"
                max="5"
            >

            <label for="score-${holeNumber}">Score</label>
            <input
                id="score-${holeNumber}"
                class="score-input"
                type="number"
                min="1"
            >

            <label for="putts-${holeNumber}">Putts</label>
            <input
                id="putts-${holeNumber}"
                class="putts-input"
                type="number"
                min="0"
            >
        `;

        holesContainer.appendChild(holeDiv);
    }
}

function calculateRound() {
    const parInputs = document.querySelectorAll(".par-input");
    const scoreInputs = document.querySelectorAll(".score-input");
    const puttsInputs = document.querySelectorAll(".putts-input");

    let totalPar = 0;
    let totalScore = 0;
    let totalPutts = 0;

    for (let index = 0; index < 18; index++) {
        if (
            parInputs[index].value === "" ||
            scoreInputs[index].value === "" ||
            puttsInputs[index].value === ""
        ) {
            resultText.textContent = "Please fill in every field.";
            return;
        }

        totalPar += Number(parInputs[index].value);
        totalScore += Number(scoreInputs[index].value);
        totalPutts += Number(puttsInputs[index].value);
    }

    const scoreDifference = totalScore - totalPar;
    let scoreToPar;

    if (scoreDifference === 0) {
        scoreToPar = "even par";
    } else if (scoreDifference > 0) {
        scoreToPar = `+${scoreDifference}`;
    } else {
        scoreToPar = `${scoreDifference}`;
    }

    resultText.textContent =
        `You shot ${totalScore} (${scoreToPar}) with ${totalPutts} putts.`;
}