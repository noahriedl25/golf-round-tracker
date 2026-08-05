const parInput = document.getElementById("par");
const scoreInput = document.getElementById("score");
const puttsInput = document.getElementById("putts");
const calculateButton = document.getElementById("calculate-button");
const resultText = document.getElementById("result");

calculateButton.addEventListener("click", calculateHole);

function calculateHole() {
    const par = Number(parInput.value);
    const score = Number(scoreInput.value);
    const putts = Number(puttsInput.value);

    if (par === 0 || score === 0 || puttsInput.value === "") {
        resultText.textContent = "Please fill in every field.";
        return;
    }

    const scoreDifference = score - par;
    let scoreName;

    if (scoreDifference <= -2) {
        scoreName = "Eagle or better";
    } else if (scoreDifference === -1) {
        scoreName = "Birdie";
    } else if (scoreDifference === 0) {
        scoreName = "Par";
    } else if (scoreDifference === 1) {
        scoreName = "Bogey";
    } else if (scoreDifference === 2) {
        scoreName = "Double bogey";
    } else {
        scoreName = `${scoreDifference} over par`;
    }

    resultText.textContent =
        `${scoreName}. You scored ${score} on a par ${par} with ${putts} putts.`;
}