const setupSection = document.getElementById("setup-section");
const roundSection = document.getElementById("round-section");
const historySection = document.getElementById("history-section");
const statisticsSection = document.getElementById("statistics-section");
const customCourseSection = document.getElementById("custom-course-section");

const courseSelect = document.getElementById("course-select");
const courseSearchForm = document.getElementById("course-search-form");
const courseSearchInput = document.getElementById("course-search-input");
const courseSearchButton = document.getElementById("course-search-button");
const courseSearchMessage = document.getElementById("course-search-message");
const courseSearchResults = document.getElementById("course-search-results");
const teeGroup = document.getElementById("tee-group");
const teeSelect = document.getElementById("tee-select");
const selectedCourseCard = document.getElementById("selected-course-card");
const selectedCourseName = document.getElementById("selected-course-name");
const selectedCourseDetails = document.getElementById("selected-course-details");
const startRoundButton = document.getElementById("start-round-button");
const addCustomCourseButton = document.getElementById("add-custom-course-button");
const customCourseBackButton = document.getElementById("custom-course-back-button");
const customCourseForm = document.getElementById("custom-course-form");
const customCourseNameInput = document.getElementById("custom-course-name");
const customTeeNameInput = document.getElementById("custom-tee-name");
const customHoleCountSelect = document.getElementById("custom-hole-count");
const customHoleList = document.getElementById("custom-hole-list");
const customCourseMessage = document.getElementById("custom-course-message");
const resumeRoundButton = document.getElementById("resume-round-button");
const historyButton = document.getElementById("history-button");
const historyBackButton = document.getElementById("history-back-button");
const historyCountText = document.getElementById("history-count");
const emptyHistoryMessage = document.getElementById("empty-history-message");
const historyList = document.getElementById("history-list");
const statisticsButton = document.getElementById("statistics-button");
const statisticsBackButton = document.getElementById("statistics-back-button");
const emptyStatisticsMessage = document.getElementById("empty-statistics-message");
const statisticsContent = document.getElementById("statistics-content");
const totalRoundsStat = document.getElementById("total-rounds-stat");
const averageScoreStat = document.getElementById("average-score-stat");
const averageToParStat = document.getElementById("average-to-par-stat");
const averagePuttsStat = document.getElementById("average-putts-stat");
const fairwaysStat = document.getElementById("fairways-stat");
const penaltiesStat = document.getElementById("penalties-stat");
const bestRoundCourse = document.getElementById("best-round-course");
const bestRoundDate = document.getElementById("best-round-date");
const bestRoundTotal = document.getElementById("best-round-total");
const bestRoundToPar = document.getElementById("best-round-to-par");
const holeTypeStats = document.getElementById("hole-type-stats");
const trendSummary = document.getElementById("trend-summary");
const recentResults = document.getElementById("recent-results");

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
const SAVED_COURSES_KEY = "golfTrackerSavedCourses";
const COURSE_SEARCH_URL = "https://api.opengolfapi.org/v1/courses/search";
const COURSE_DETAIL_URL = "https://api.opengolfapi.org/api/v1/courses";
const US_STATE_CODES = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC"
]);

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
            console.error("Offline support could not be started.", error);
        });
    });
}



const courses = {
    standard: {
        id: "standard",
        name: "Standard Par 72 Course",
        teeName: "Default",
        source: "built-in",

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
        id: "practice",
        name: "Practice Course",
        teeName: "Default",
        source: "built-in",

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
let pendingApiCourseDetail = null;

startRoundButton.addEventListener("click", startRound);
courseSelect.addEventListener("change", selectSavedCourse);
courseSearchForm.addEventListener("submit", searchCourses);
teeSelect.addEventListener("change", selectApiTee);
addCustomCourseButton.addEventListener("click", showCustomCourse);
customCourseBackButton.addEventListener("click", showSetup);
customCourseForm.addEventListener("submit", saveCustomCourse);
customHoleCountSelect.addEventListener("change", renderCustomHoleRows);
previousButton.addEventListener("click", goToPreviousHole);
nextButton.addEventListener("click", saveHoleAndContinue);
resumeRoundButton.addEventListener("click", resumeSavedRound);
historyButton.addEventListener("click", showRoundHistory);
historyBackButton.addEventListener("click", showSetup);
statisticsButton.addEventListener("click", showStatistics);
statisticsBackButton.addEventListener("click", showSetup);

scoreInput.addEventListener("change", saveInputProgress);
puttsInput.addEventListener("change", saveInputProgress);
fairwayInput.addEventListener("change", saveInputProgress);
penaltiesInput.addEventListener("change", saveInputProgress);

loadSavedCourses();
selectSavedCourse();
renderCustomHoleRows();
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

function getSavedCourses() {
    const savedCoursesText = localStorage.getItem(SAVED_COURSES_KEY);

    if (savedCoursesText === null) {
        return [];
    }

    try {
        const savedCourses = JSON.parse(savedCoursesText);
        return Array.isArray(savedCourses)
            ? savedCourses.filter(isValidCourse)
            : [];
    } catch {
        return [];
    }
}

function isValidCourse(course) {
    return (
        course !== null &&
        typeof course === "object" &&
        typeof course.id === "string" &&
        course.id.length > 0 &&
        typeof course.name === "string" &&
        course.name.length > 0 &&
        Array.isArray(course.holes) &&
        course.holes.length > 0 &&
        course.holes.length <= 36 &&
        course.holes.every(function (hole) {
            return (
                Number.isFinite(hole.number) &&
                Number.isFinite(hole.par) &&
                (hole.yardage === null || Number.isFinite(hole.yardage))
            );
        })
    );
}

function loadSavedCourses() {
    getSavedCourses().forEach(function (course) {
        courses[course.id] = course;
        addCourseOption(course);
    });
}

function saveCourse(course) {
    const savedCourses = getSavedCourses();
    const existingIndex = savedCourses.findIndex(function (savedCourse) {
        return savedCourse.id === course.id;
    });

    if (existingIndex === -1) {
        savedCourses.push(course);
    } else {
        savedCourses[existingIndex] = course;
    }

    localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(savedCourses));
    courses[course.id] = course;
    addCourseOption(course);
}

function addCourseOption(course) {
    let option = Array.from(courseSelect.options).find(function (courseOption) {
        return courseOption.value === course.id;
    });

    if (option === undefined) {
        option = document.createElement("option");
        option.value = course.id;
        courseSelect.append(option);
    }

    option.textContent = getCourseOptionLabel(course);
}

function getCourseOptionLabel(course) {
    return course.teeName && course.teeName !== "Default"
        ? `${course.name} — ${course.teeName}`
        : course.name;
}

function selectSavedCourse() {
    selectedCourse = courses[courseSelect.value] ?? null;
    pendingApiCourseDetail = null;
    teeGroup.classList.add("hidden");
    updateSelectedCourseCard();
}

function updateSelectedCourseCard() {
    const hasCourse = selectedCourse !== null;
    selectedCourseCard.classList.toggle("hidden", !hasCourse);
    startRoundButton.disabled = !hasCourse;

    if (!hasCourse) {
        return;
    }

    const totalPar = selectedCourse.holes.reduce(function (total, hole) {
        return total + hole.par;
    }, 0);
    const totalYardage = selectedCourse.holes.reduce(function (total, hole) {
        return total + (Number.isFinite(hole.yardage) ? hole.yardage : 0);
    }, 0);
    const details = [];

    if (selectedCourse.teeName && selectedCourse.teeName !== "Default") {
        details.push(selectedCourse.teeName);
    }

    details.push(`${selectedCourse.holes.length} holes`, `Par ${totalPar}`);

    if (totalYardage > 0) {
        details.push(`${totalYardage.toLocaleString()} yards`);
    }

    selectedCourseName.textContent = selectedCourse.name;
    selectedCourseDetails.textContent = details.join(" · ");
}

async function searchCourses(event) {
    event.preventDefault();
    const query = courseSearchInput.value.trim();

    if (query.length < 2) {
        courseSearchMessage.textContent = "Enter at least 2 characters.";
        return;
    }

    setSearchLoading(true);
    courseSearchResults.replaceChildren();
    teeGroup.classList.add("hidden");
    courseSearchMessage.textContent = "Searching U.S. courses…";

    try {
        const response = await fetch(`${COURSE_SEARCH_URL}?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Course search returned ${response.status}.`);
        }

        const data = await response.json();
        const results = Array.isArray(data.courses)
            ? data.courses.filter(function (course) {
                return US_STATE_CODES.has(String(course.state ?? "").toUpperCase());
            })
            : [];

        renderCourseSearchResults(results);
    } catch (error) {
        console.error("Course search failed.", error);
        courseSearchMessage.textContent =
            "Course search needs an internet connection. You can still use a saved or custom course.";
    } finally {
        setSearchLoading(false);
    }
}

function setSearchLoading(isLoading) {
    courseSearchButton.disabled = isLoading;
    courseSearchButton.textContent = isLoading ? "Searching…" : "Search";
}

function renderCourseSearchResults(results) {
    courseSearchResults.replaceChildren();

    if (results.length === 0) {
        courseSearchMessage.textContent =
            "No U.S. courses found. Try another spelling or add it as a custom course.";
        return;
    }

    courseSearchMessage.textContent =
        `${results.length} U.S. ${results.length === 1 ? "course" : "courses"} found`;

    results.forEach(function (course) {
        const button = document.createElement("button");
        const name = document.createElement("strong");
        const location = document.createElement("span");

        button.type = "button";
        button.className = "course-result";
        name.textContent = course.course_name || course.name || "Unnamed course";
        location.textContent = [course.city, course.state].filter(Boolean).join(", ");
        button.append(name, location);
        button.addEventListener("click", function () {
            loadCourseDetails(course);
        });
        courseSearchResults.append(button);
    });
}

async function loadCourseDetails(searchResult) {
    courseSearchMessage.textContent = "Loading scorecard and tee boxes…";
    teeGroup.classList.add("hidden");

    try {
        const response = await fetch(
            `${COURSE_DETAIL_URL}/${encodeURIComponent(searchResult.id)}`
        );

        if (!response.ok) {
            throw new Error(`Course details returned ${response.status}.`);
        }

        const detail = await response.json();
        const tees = Array.isArray(detail.tees) ? detail.tees : [];
        const holes = Array.isArray(detail.holes_data) ? detail.holes_data : [];

        if (tees.length === 0 || holes.length === 0) {
            throw new Error("No complete scorecard is available.");
        }

        pendingApiCourseDetail = detail;
        teeSelect.replaceChildren();

        tees.forEach(function (tee, index) {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = getTeeLabel(tee);
            teeSelect.append(option);
        });

        teeGroup.classList.remove("hidden");
        courseSearchMessage.textContent = "Choose the tee box you will play.";
        selectApiTee();
        teeSelect.focus();
    } catch (error) {
        console.error("Course scorecard could not be loaded.", error);
        courseSearchMessage.textContent =
            "This course does not have a complete scorecard yet. You can add it as a custom course.";
    }
}

function getTeeLabel(tee) {
    const details = [tee.tee_name || tee.tee_color || "Tee"];

    if (tee.gender) {
        details.push(tee.gender);
    }

    if (Number.isFinite(Number(tee.yardage))) {
        details.push(`${Number(tee.yardage).toLocaleString()} yds`);
    }

    if (tee.course_rating && tee.slope) {
        details.push(`${tee.course_rating}/${tee.slope}`);
    }

    return details.join(" · ");
}

function selectApiTee() {
    if (pendingApiCourseDetail === null) {
        return;
    }

    const tee = pendingApiCourseDetail.tees[Number(teeSelect.value)];

    if (tee === undefined) {
        return;
    }

    const teeKey = String(tee.tee_color || tee.tee_name || "").toLowerCase();
    const holes = pendingApiCourseDetail.holes_data.map(function (hole) {
        const yardages = hole.yardages ?? {};
        const yardage = Number(yardages[teeKey] ?? yardages.web);

        return {
            number: Number(hole.number),
            par: Number(hole.par),
            yardage: Number.isFinite(yardage) && yardage > 0 ? yardage : null,
            handicapIndex: Number.isFinite(Number(hole.handicap_index))
                ? Number(hole.handicap_index)
                : null
        };
    });
    const teeIdentifier = tee.tee_key || tee.tee_name || tee.tee_color || teeSelect.value;
    const course = {
        id: `api:${pendingApiCourseDetail.id}:${teeIdentifier}`,
        externalId: pendingApiCourseDetail.id,
        name: pendingApiCourseDetail.course_name || pendingApiCourseDetail.club_name,
        teeName: [tee.tee_name || tee.tee_color, tee.gender].filter(Boolean).join(" · "),
        location: [pendingApiCourseDetail.city, pendingApiCourseDetail.state]
            .filter(Boolean)
            .join(", "),
        source: "opengolfapi",
        holes: holes
    };

    if (!isValidCourse(course)) {
        courseSearchMessage.textContent = "This tee box has incomplete scorecard data.";
        return;
    }

    saveCourse(course);
    courseSelect.value = course.id;
    selectedCourse = course;
    updateSelectedCourseCard();
    courseSearchMessage.textContent = "Course saved on this device and ready to play.";
}

function showCustomCourse() {
    setupSection.classList.add("hidden");
    historySection.classList.add("hidden");
    statisticsSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    customCourseSection.classList.remove("hidden");
    customCourseMessage.textContent = "";
    customCourseNameInput.focus();
}

function renderCustomHoleRows() {
    const holeCount = Number(customHoleCountSelect.value);
    const existingRows = Array.from(customHoleList.querySelectorAll(".custom-hole-row"));
    const existingValues = existingRows.map(function (row) {
        return {
            par: row.querySelector(".custom-par-input").value,
            yardage: row.querySelector(".custom-yardage-input").value
        };
    });

    customHoleList.replaceChildren();

    for (let holeNumber = 1; holeNumber <= holeCount; holeNumber++) {
        const row = document.createElement("div");
        const number = document.createElement("span");
        const parInput = document.createElement("input");
        const yardageInput = document.createElement("input");

        row.className = "custom-hole-row";
        number.className = "hole-number-chip";
        number.textContent = holeNumber;
        parInput.className = "custom-par-input";
        parInput.type = "number";
        parInput.min = "3";
        parInput.max = "6";
        parInput.required = true;
        parInput.setAttribute("aria-label", `Hole ${holeNumber} par`);
        parInput.value = existingValues[holeNumber - 1]?.par || "4";
        yardageInput.className = "custom-yardage-input";
        yardageInput.type = "number";
        yardageInput.min = "1";
        yardageInput.required = true;
        yardageInput.placeholder = "Yards";
        yardageInput.setAttribute("aria-label", `Hole ${holeNumber} yards`);
        yardageInput.value = existingValues[holeNumber - 1]?.yardage || "";
        row.append(number, parInput, yardageInput);
        customHoleList.append(row);
    }
}

function saveCustomCourse(event) {
    event.preventDefault();
    const name = customCourseNameInput.value.trim();
    const teeName = customTeeNameInput.value.trim();
    const rows = Array.from(customHoleList.querySelectorAll(".custom-hole-row"));
    const holes = rows.map(function (row, index) {
        return {
            number: index + 1,
            par: Number(row.querySelector(".custom-par-input").value),
            yardage: Number(row.querySelector(".custom-yardage-input").value)
        };
    });

    if (
        name.length === 0 ||
        teeName.length === 0 ||
        holes.some(function (hole) {
            return (
                !Number.isInteger(hole.par) ||
                hole.par < 3 ||
                hole.par > 6 ||
                !Number.isFinite(hole.yardage) ||
                hole.yardage <= 0
            );
        })
    ) {
        customCourseMessage.textContent =
            "Enter a course name, tee box, and valid par and yardage for every hole.";
        return;
    }

    const course = {
        id: `custom:${Date.now()}`,
        name: name,
        teeName: teeName,
        source: "custom",
        holes: holes
    };

    saveCourse(course);
    courseSelect.value = course.id;
    selectedCourse = course;
    customCourseForm.reset();
    customHoleCountSelect.value = "9";
    renderCustomHoleRows();
    showSetup();
    courseSearchMessage.textContent = "Custom course saved and ready to play.";
    updateSelectedCourseCard();
}

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
        courseId: selectedCourse.id ?? courseSelect.value,
        course: selectedCourse,
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

    if (!isValidCourse(selectedCourse)) {
        courseSearchMessage.textContent = "Choose a course before starting your round.";
        return;
    }

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
    holeYardageText.textContent = currentHole.yardage ?? "—";

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
        const course = isValidCourse(savedRound.course)
            ? savedRound.course
            : courses[savedRound.courseId];

        if (
            !isValidCourse(course) ||
            !Number.isInteger(savedRound.currentHoleIndex) ||
            savedRound.currentHoleIndex < 0 ||
            savedRound.currentHoleIndex >= course.holes.length ||
            !Array.isArray(savedRound.roundResults) ||
            savedRound.roundResults.length !== course.holes.length
        ) {
            return null;
        }

        savedRound.course = course;
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

    selectedCourse = savedRound.course;
    currentHoleIndex = savedRound.currentHoleIndex;
    roundResults = savedRound.roundResults;

    courses[selectedCourse.id] = selectedCourse;
    addCourseOption(selectedCourse);
    courseSelect.value = selectedCourse.id;

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
        Number.isFinite(round.fairwaysHit) &&
        Number.isFinite(round.fairwayOpportunities) &&
        Number.isFinite(round.fairwayPercentage) &&
        Array.isArray(round.holes) &&
        round.holes.length > 0 &&
        round.holes.every(function (hole) {
            return (
                Number.isFinite(hole.number) &&
                Number.isFinite(hole.par) &&
                Number.isFinite(hole.score) &&
                Number.isFinite(hole.putts) &&
                Number.isFinite(hole.penalties)
            );
        })
    );
}

function saveCompletedRound(round) {
    const history = getRoundHistory();
    history.unshift(round);
    localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(history));
}

function showRoundHistory() {
    setupSection.classList.add("hidden");
    statisticsSection.classList.add("hidden");
    customCourseSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    historySection.classList.remove("hidden");
    renderRoundHistory();
}

function showSetup() {
    historySection.classList.add("hidden");
    statisticsSection.classList.add("hidden");
    customCourseSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    setupSection.classList.remove("hidden");
}

function showStatistics() {
    setupSection.classList.add("hidden");
    historySection.classList.add("hidden");
    customCourseSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    statisticsSection.classList.remove("hidden");
    renderStatistics();
}

function renderStatistics() {
    const history = getRoundHistory();
    const hasRounds = history.length > 0;

    emptyStatisticsMessage.classList.toggle("hidden", hasRounds);
    statisticsContent.classList.toggle("hidden", !hasRounds);

    if (!hasRounds) {
        return;
    }

    const statistics = calculateStatistics(history);

    totalRoundsStat.textContent = statistics.totalRounds;
    averageScoreStat.textContent = formatGroupedAverage(
        statistics.roundLengths,
        "totalScore"
    );
    averageToParStat.textContent = formatGroupedAverage(
        statistics.roundLengths,
        "scoreToPar",
        true
    );
    averagePuttsStat.textContent = formatGroupedAverage(
        statistics.roundLengths,
        "totalPutts"
    );
    fairwaysStat.textContent = `${statistics.fairwayPercentage}%`;
    penaltiesStat.textContent = formatGroupedAverage(
        statistics.roundLengths,
        "totalPenalties"
    );

    bestRoundCourse.textContent = statistics.bestRound.courseName;
    bestRoundDate.textContent =
        `${formatRoundDate(statistics.bestRound.completedAt)} · ` +
        `${statistics.bestRound.holes.length} holes`;
    bestRoundTotal.textContent = statistics.bestRound.totalScore;
    bestRoundToPar.textContent = formatScoreToPar(statistics.bestRound.scoreToPar);

    renderHoleTypeStatistics(statistics.holeTypes);
    renderRecentResults(history.slice(0, 5));
}

function calculateStatistics(history) {
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

    history.forEach(function (round) {
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

        round.holes.forEach(function (hole) {
            if (holeTypes[hole.par] !== undefined && Number.isFinite(hole.score)) {
                holeTypes[hole.par].strokes += hole.score;
                holeTypes[hole.par].holes++;
            }
        });
    });

    const bestRound = history.reduce(function (best, round) {
        const roundRate = round.scoreToPar / round.holes.length;
        const bestRate = best.scoreToPar / best.holes.length;

        if (roundRate < bestRate) {
            return round;
        }

        if (
            roundRate === bestRate &&
            round.totalScore < best.totalScore
        ) {
            return round;
        }

        return best;
    });

    return {
        totalRounds: history.length,
        averageScore: totalScore / history.length,
        averageToPar: totalToPar / history.length,
        averagePutts: totalPutts / history.length,
        averagePenalties: totalPenalties / history.length,
        fairwayPercentage:
            fairwayOpportunities === 0
                ? 0
                : Math.round((fairwaysHit / fairwayOpportunities) * 100),
        bestRound: bestRound,
        roundLengths: roundLengths,
        holeTypes: holeTypes
    };
}

function renderHoleTypeStatistics(holeTypes) {
    holeTypeStats.replaceChildren();

    [3, 4, 5].forEach(function (par) {
        const result = holeTypes[par];
        const card = document.createElement("div");
        const label = document.createElement("span");
        const value = document.createElement("strong");
        const comparison = document.createElement("small");

        label.textContent = `Par ${par}`;

        if (result.holes === 0) {
            value.textContent = "—";
            comparison.textContent = "No holes";
        } else {
            const average = result.strokes / result.holes;
            value.textContent = formatAverage(average);
            comparison.textContent = `${formatAverageToPar(average - par)} avg`;
        }

        card.append(label, value, comparison);
        holeTypeStats.append(card);
    });
}

function renderRecentResults(recentRounds) {
    recentResults.replaceChildren();

    const chronologicalRounds = [...recentRounds].reverse();
    const oldestRound = chronologicalRounds[0];
    const newestRound = chronologicalRounds[chronologicalRounds.length - 1];
    const hasMixedLengths = chronologicalRounds.some(function (round) {
        return round.holes.length !== oldestRound.holes.length;
    });

    if (chronologicalRounds.length === 1) {
        trendSummary.textContent = "Complete another round to see your trend.";
    } else if (hasMixedLengths) {
        trendSummary.textContent =
            "Different round lengths are shown separately for a fair comparison.";
    } else {
        const change = newestRound.scoreToPar - oldestRound.scoreToPar;

        if (change < 0) {
            trendSummary.textContent = `Improved by ${Math.abs(change)} strokes across these rounds.`;
        } else if (change > 0) {
            trendSummary.textContent = `${change} strokes higher than the first round shown.`;
        } else {
            trendSummary.textContent = "Your score to par is unchanged across these rounds.";
        }
    }

    chronologicalRounds.forEach(function (round) {
        const row = document.createElement("div");
        const details = document.createElement("div");
        const course = document.createElement("strong");
        const date = document.createElement("span");
        const score = document.createElement("strong");

        row.className = "recent-result";
        course.textContent = round.courseName;
        date.textContent = formatRoundDate(round.completedAt);
        score.className = "recent-result-score";
        score.textContent =
            `${formatScoreToPar(round.scoreToPar)} · ${round.holes.length}H`;

        details.append(course, date);
        row.append(details, score);
        recentResults.append(row);
    });
}

function formatAverage(value) {
    return value.toFixed(1);
}

function formatGroupedAverage(roundLengths, property, formatToPar = false) {
    return Object.keys(roundLengths)
        .map(Number)
        .sort(function (first, second) {
            return first - second;
        })
        .map(function (holeCount) {
            const group = roundLengths[holeCount];
            const average = group[property] / group.rounds;
            const formattedAverage = formatToPar
                ? formatAverageToPar(average)
                : formatAverage(average);

            return `${formattedAverage} (${holeCount}H)`;
        })
        .join("\n");
}

function formatAverageToPar(value) {
    const roundedValue = Math.round(value * 10) / 10;

    if (roundedValue === 0) {
        return "Even";
    }

    return roundedValue > 0 ? `+${roundedValue}` : String(roundedValue);
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
    completedDate.textContent = [round.teeName, formatRoundDate(round.completedAt)]
        .filter(Boolean)
        .join(" · ");
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
        teeName: selectedCourse.teeName ?? "",
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
