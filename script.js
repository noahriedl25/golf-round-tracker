/* Browser controller: page navigation, input, and offline scoring.
 * Python provides database storage and statistics when the local server runs.
 * The calculation functions here are also needed on GitHub Pages and offline.
 * Read docs/CODE_GUIDE.md for the request flow and suggested reading order.
 */

// 1. Page references: cache elements once instead of repeatedly searching HTML.
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
const roundFormatGroup = document.getElementById("round-format-group");
const roundFormatSelect = document.getElementById("round-format-select");
const selectedCourseCard = document.getElementById("selected-course-card");
const selectedCourseName = document.getElementById("selected-course-name");
const selectedCourseDetails = document.getElementById("selected-course-details");
const startRoundButton = document.getElementById("start-round-button");
const addCustomCourseButton = document.getElementById("add-custom-course-button");
const favoriteCourseButton = document.getElementById("favorite-course-button");
const editCourseButton = document.getElementById("edit-course-button");
const activeRoundCard = document.getElementById("active-round-card");
const activeRoundDetails = document.getElementById("active-round-details");
const discardRoundButton = document.getElementById("discard-round-button");
const dashboardCareerRounds = document.getElementById("dashboard-career-rounds");
const dashboardHandicap = document.getElementById("dashboard-handicap");
const dashboardPersonalBest = document.getElementById("dashboard-personal-best");
const homeRecentRound = document.getElementById("home-recent-round");
const homeRecentRoundCourse = document.getElementById("home-recent-round-course");
const homeRecentRoundDetails = document.getElementById("home-recent-round-details");
const homeFavoritesSection = document.getElementById("home-favorites-section");
const homeFavoriteCourses = document.getElementById("home-favorite-courses");
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
const personalBests = document.getElementById("personal-bests");
const statisticsPeriodLabel = document.getElementById("statistics-period-label");
const handicapEstimateStat = document.getElementById("handicap-estimate-stat");
const eligibleDifferentialsStat = document.getElementById("eligible-differentials-stat");
const careerStartText = document.getElementById("career-start-text");
const resetCareerButton = document.getElementById("reset-career-button");
const undoCareerResetButton = document.getElementById("undo-career-reset-button");

const editRoundDialog = document.getElementById("edit-round-dialog");
const editRoundSubtitle = document.getElementById("edit-round-subtitle");
const editRoundForm = document.getElementById("edit-round-form");
const editRoundScorecard = document.getElementById("edit-round-scorecard");
const editRoundMessage = document.getElementById("edit-round-message");
const closeEditRoundButton = document.getElementById("close-edit-round-button");

const roundHomeButton = document.getElementById("round-home-button");
const scorecardOverviewButton = document.getElementById("scorecard-overview-button");
const scorecardOverviewDialog = document.getElementById("scorecard-overview-dialog");
const scorecardOverviewSubtitle = document.getElementById("scorecard-overview-subtitle");
const scorecardOverviewContent = document.getElementById("scorecard-overview-content");
const closeScorecardButton = document.getElementById("close-scorecard-button");
const roundConditionsText = document.getElementById("round-conditions");

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
const PYTHON_PENDING_KEY = "golfTrackerPythonPending";
// A promise queue makes saves run in order, preventing older writes winning.
let pythonSaveQueue = Promise.resolve();
const ROUND_HISTORY_KEY = "golfTrackerRoundHistory";
const SAVED_COURSES_KEY = "golfTrackerSavedCourses";
const FAVORITE_COURSES_KEY = "golfTrackerFavoriteCourses";
const CAREER_START_KEY = "golfTrackerCareerStart";
const PREVIOUS_CAREER_START_KEY = "golfTrackerPreviousCareerStart";
const COURSE_SEARCH_URL = "https://api.opengolfapi.org/v1/courses/search";
const COURSE_DETAIL_URL = "https://api.opengolfapi.org/api/v1/courses";
const HON_E_KOR_API_ID = "a85a271e-6abd-4fab-8ed6-9b96c6fe9cb9";
const US_STATE_CODES = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC"
]);

const HON_E_KOR_NINE_DATA = [
    {
        id: "red",
        name: "Red Nine",
        holes: [
            { par: 4, blue: 287, white: 303, red: 296 },
            { par: 4, blue: 351, white: 341, red: 334 },
            { par: 4, blue: 311, white: 288, red: 278 },
            { par: 4, blue: 460, white: 433, red: 314 },
            { par: 3, blue: 180, white: 129, red: 120 },
            { par: 4, blue: 332, white: 305, red: 278 },
            { par: 3, blue: 205, white: 196, red: 190 },
            { par: 4, blue: 395, white: 337, red: 329 },
            { par: 5, blue: 556, white: 543, red: 432 }
        ]
    },
    {
        id: "white",
        name: "White Nine",
        holes: [
            { par: 4, blue: 332, white: 332, red: 316 },
            { par: 4, blue: 383, white: 337, red: 327 },
            { par: 3, blue: 164, white: 164, red: 144 },
            { par: 5, blue: 493, white: 493, red: 428 },
            { par: 4, blue: 414, white: 414, red: 366 },
            { par: 4, blue: 355, white: 329, red: 322 },
            { par: 3, blue: 175, white: 175, red: 130 },
            { par: 4, blue: 326, white: 311, red: 274 },
            { par: 4, blue: 402, white: 360, red: 331 }
        ]
    },
    {
        id: "blue",
        name: "Blue Nine",
        holes: [
            { par: 4, blue: 365, white: 365, red: 350 },
            { par: 4, blue: 403, white: 403, red: 291 },
            { par: 5, blue: 534, white: 507, red: 437 },
            { par: 3, blue: 150, white: 150, red: 141 },
            { par: 3, blue: 204, white: 169, red: 130 },
            { par: 4, blue: 453, white: 401, red: 306 },
            { par: 4, blue: 348, white: 348, red: 321 },
            { par: 4, blue: 314, white: 314, red: 302 },
            { par: 4, blue: 325, white: 325, red: 309 }
        ]
    }
];

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
            console.error("Offline support could not be started.", error);
        });
    });
}



// 2. Built-in scorecards. Imported and custom courses use the same structure.
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
    },
    "honekor:blue": createHonEKorCourse("blue"),
    "honekor:white": createHonEKorCourse("white"),
    "honekor:red": createHonEKorCourse("red")
};

function createHonEKorCourse(teeKey) {
    // Red/White/Blue nines are layouts; teeKey chooses yardages within each nine.
    const nines = HON_E_KOR_NINE_DATA.map(function (nine) {
        return {
            id: nine.id,
            name: nine.name,
            holes: nine.holes.map(function (hole, index) {
                return {
                    number: index + 1,
                    par: hole.par,
                    yardage: hole[teeKey]
                };
            })
        };
    });

    return {
        id: `honekor:${teeKey}`,
        externalId: HON_E_KOR_API_ID,
        name: "Hon-E-Kor Country Club",
        teeName: `${teeKey[0].toUpperCase()}${teeKey.slice(1)} Tee`,
        location: "Kewaskum, WI",
        latitude: 43.515106,
        longitude: -88.2144325,
        source: "verified",
        nines: nines,
        holes: nines.flatMap(function (nine) {
            return nine.holes;
        })
    };
}

// 3. Current screen state. Persistent copies are saved in localStorage.
let selectedCourse = null;
let currentHoleIndex = 0;
let roundResults = [];
let pendingApiCourseDetail = null;
let editingCourseId = null;
let roundConditions = null;
let activeRoundToken = null;
let editingCompletedRoundId = null;

// 4. Event wiring: connect each visible control to its handler.
startRoundButton.addEventListener("click", startRound);
courseSelect.addEventListener("change", selectSavedCourse);
courseSearchForm.addEventListener("submit", searchCourses);
teeSelect.addEventListener("change", selectApiTee);
roundFormatSelect.addEventListener("change", updateSelectedCourseCard);
addCustomCourseButton.addEventListener("click", function () {
    showCustomCourse();
});
favoriteCourseButton.addEventListener("click", toggleFavoriteCourse);
editCourseButton.addEventListener("click", editSelectedCourse);
discardRoundButton.addEventListener("click", discardSavedRound);
resetCareerButton.addEventListener("click", resetCareerStatistics);
undoCareerResetButton.addEventListener("click", undoCareerReset);
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
roundHomeButton.addEventListener("click", saveRoundAndGoHome);
scorecardOverviewButton.addEventListener("click", showScorecardOverview);
closeScorecardButton.addEventListener("click", function () {
    scorecardOverviewDialog.close();
});
closeEditRoundButton.addEventListener("click", function () {
    editRoundDialog.close();
});
editRoundForm.addEventListener("submit", saveEditedCompletedRound);

scoreInput.addEventListener("change", saveInputProgress);
puttsInput.addEventListener("change", saveInputProgress);
fairwayInput.addEventListener("change", saveInputProgress);
penaltiesInput.addEventListener("change", saveInputProgress);

["honekor:blue", "honekor:white", "honekor:red"].forEach(function (courseId) {
    addCourseOption(courses[courseId]);
});
loadSavedCourses();
selectSavedCourse();
renderCustomHoleRows();
checkForSavedRound();
renderHomeDashboard();
syncRoundsWithPythonBackend();

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

// 5. Course management: validate stored data before displaying or playing it.
function getSavedCourses() {
    const savedCoursesText = localStorage.getItem(SAVED_COURSES_KEY);

    if (savedCoursesText === null) {
        return [];
    }

    try {
        const savedCourses = JSON.parse(savedCoursesText);
        return Array.isArray(savedCourses)
            ? savedCourses.filter(function (course) {
                return (
                    isValidCourse(course) &&
                    !(
                        course.externalId === HON_E_KOR_API_ID &&
                        !course.id.startsWith("honekor:")
                    )
                );
            })
            : [];
    } catch {
        return [];
    }
}

function getFavoriteCourseIds() {
    // Store IDs rather than duplicate course objects, so edits stay consistent.
    const favoriteText = localStorage.getItem(FAVORITE_COURSES_KEY);

    if (favoriteText === null) {
        return [];
    }

    try {
        const favoriteIds = JSON.parse(favoriteText);
        return Array.isArray(favoriteIds)
            ? favoriteIds.filter(function (id) {
                return typeof id === "string";
            })
            : [];
    } catch {
        return [];
    }
}

function isFavoriteCourse(courseId) {
    return getFavoriteCourseIds().includes(courseId);
}

function toggleFavoriteCourse() {
    if (selectedCourse === null) {
        return;
    }

    const courseId = selectedCourse.id;
    const favoriteIds = getFavoriteCourseIds();
    const existingIndex = favoriteIds.indexOf(courseId);

    if (existingIndex === -1) {
        favoriteIds.push(courseId);
    } else {
        favoriteIds.splice(existingIndex, 1);
    }

    localStorage.setItem(FAVORITE_COURSES_KEY, JSON.stringify(favoriteIds));
    addCourseOption(courses[courseId] ?? selectedCourse);
    updateCourseActionButtons();
    renderHomeDashboard();
}

function isValidCourse(course) {
    // Storage and external API data can be missing fields; reject it early.
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
    // An existing ID means an edit; a new ID means a newly saved course.
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
    const label = course.teeName && course.teeName !== "Default"
        ? `${course.name} — ${course.teeName}`
        : course.name;

    return isFavoriteCourse(course.id) ? `★ ${label}` : label;
}

function selectSavedCourse() {
    selectedCourse = courses[courseSelect.value] ?? null;
    pendingApiCourseDetail = null;
    teeGroup.classList.add("hidden");
    updateRoundFormatOptions();
    updateSelectedCourseCard();
}

function updateRoundFormatOptions(preferredFormat) {
    // Available choices depend on whether a course has 9, 18, or several nines.
    roundFormatSelect.replaceChildren();

    if (selectedCourse === null) {
        roundFormatGroup.classList.add("hidden");
        return;
    }

    roundFormatGroup.classList.remove("hidden");
    const holeCount = selectedCourse.holes.length;
    let options;

    if (Array.isArray(selectedCourse.nines) && selectedCourse.nines.length > 1) {
        options = selectedCourse.nines.map(function (nine) {
            return {
                value: `nine:${nine.id}`,
                label: `${nine.name} (9 Holes)`
            };
        });

        selectedCourse.nines.forEach(function (firstNine) {
            selectedCourse.nines.forEach(function (secondNine) {
                if (firstNine.id !== secondNine.id) {
                    options.push({
                        value: `combo:${firstNine.id}:${secondNine.id}`,
                        label: `${firstNine.name.replace(" Nine", "")} Front → ` +
                            `${secondNine.name.replace(" Nine", "")} Back (18 Holes)`
                    });
                }
            });
        });
    } else {
        options = holeCount >= 18
            ? [
            { value: "18", label: "Full 18 Holes" },
            { value: "front9", label: "Front 9" },
            { value: "back9", label: "Back 9" }
        ]
            : [{ value: "all", label: `All ${holeCount} Holes` }];
    }

    options.forEach(function (roundOption) {
        const option = document.createElement("option");
        option.value = roundOption.value;
        option.textContent = roundOption.label;
        roundFormatSelect.append(option);
    });

    if (preferredFormat && options.some(function (option) {
        return option.value === preferredFormat;
    })) {
        roundFormatSelect.value = preferredFormat;
    }
}

// Build a playable scorecard from the selected nine(s), preserving hole order.
function getRoundSelection(course, format = roundFormatSelect.value) {
    if (format.startsWith("nine:") && Array.isArray(course.nines)) {
        const nineId = format.split(":")[1];
        const nine = course.nines.find(function (courseNine) {
            return courseNine.id === nineId;
        });

        if (nine !== undefined) {
            return {
                format: format,
                label: nine.name,
                holes: nine.holes.map(function (hole, index) {
                    return {
                        ...hole,
                        number: index + 1,
                        nineId: nine.id,
                        nineName: nine.name
                    };
                })
            };
        }
    }

    if (format.startsWith("combo:") && Array.isArray(course.nines)) {
        const [, firstId, secondId] = format.split(":");
        const firstNine = course.nines.find(function (nine) {
            return nine.id === firstId;
        });
        const secondNine = course.nines.find(function (nine) {
            return nine.id === secondId;
        });

        if (firstNine !== undefined && secondNine !== undefined) {
            const firstName = firstNine.name.replace(" Nine", "");
            const secondName = secondNine.name.replace(" Nine", "");
            const holes = [firstNine, secondNine].flatMap(function (nine, nineIndex) {
                return nine.holes.map(function (hole, index) {
                    return {
                        ...hole,
                        number: index + 1 + (nineIndex * 9),
                        nineId: nine.id,
                        nineName: nine.name
                    };
                });
            });

            return {
                format: format,
                label: `${firstName} → ${secondName}`,
                holes: holes
            };
        }
    }

    if (format === "front9") {
        return {
            format: "front9",
            label: "Front 9",
            holes: course.holes.slice(0, 9)
        };
    }

    if (format === "back9") {
        return {
            format: "back9",
            label: "Back 9",
            holes: course.holes.slice(9, 18)
        };
    }

    if (format === "18") {
        return {
            format: "18",
            label: "Full 18",
            holes: course.holes.slice(0, 18)
        };
    }

    return {
        format: "all",
        label: `${course.holes.length} Holes`,
        holes: course.holes.slice()
    };
}

function updateSelectedCourseCard() {
    const hasCourse = selectedCourse !== null;
    selectedCourseCard.classList.toggle("hidden", !hasCourse);
    startRoundButton.disabled = !hasCourse;
    updateCourseActionButtons();

    if (!hasCourse) {
        return;
    }

    const roundSelection = getRoundSelection(selectedCourse);
    const totalPar = roundSelection.holes.reduce(function (total, hole) {
        return total + hole.par;
    }, 0);
    const totalYardage = roundSelection.holes.reduce(function (total, hole) {
        return total + (Number.isFinite(hole.yardage) ? hole.yardage : 0);
    }, 0);
    const details = [];

    if (selectedCourse.teeName && selectedCourse.teeName !== "Default") {
        details.push(selectedCourse.teeName);
    }

    details.push(roundSelection.label, `Par ${totalPar}`);

    if (totalYardage > 0) {
        details.push(`${totalYardage.toLocaleString()} yards`);
    }

    selectedCourseName.textContent = selectedCourse.name;
    selectedCourseDetails.textContent = details.join(" · ");
}

function updateCourseActionButtons() {
    const hasCourse = selectedCourse !== null;
    favoriteCourseButton.disabled = !hasCourse;
    favoriteCourseButton.textContent =
        hasCourse && isFavoriteCourse(selectedCourse.id)
            ? "★ Favorited"
            : "☆ Favorite";
    editCourseButton.classList.toggle(
        "hidden",
        !hasCourse ||
            selectedCourse.source === "built-in" ||
            Array.isArray(selectedCourse.nines)
    );
}

// 6. External course API: asynchronous requests must leave scoring responsive.
async function searchCourses(event) {
    event.preventDefault();
    if (courseSearchButton.disabled) return;
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
    // One search at a time prevents late ZIP/GPS results replacing a name search.
    ["nearby-zip-button", "nearby-location-button"].forEach(function (id) {
        const button = document.getElementById(id);
        if (button) button.disabled = isLoading;
    });
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
        if (Number.isFinite(course.distance_mi)) {
            location.textContent += ` · ${course.distance_mi.toFixed(1)} miles away`;
        }
        button.append(name, location);
        button.addEventListener("click", function () {
            loadCourseDetails(course);
        });
        courseSearchResults.append(button);
    });
}

async function loadCourseDetails(searchResult) {
    // Search results are summaries. Fetch a full record before showing tees.
    courseSearchMessage.textContent = "Loading scorecard and tee boxes…";
    teeGroup.classList.add("hidden");

    if (searchResult.id === HON_E_KOR_API_ID) {
        loadHonEKorDetails();
        return;
    }

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

function loadHonEKorDetails() {
    pendingApiCourseDetail = {
        specialCourse: "honekor",
        tees: [
            { tee_key: "blue", tee_name: "Blue Tee" },
            { tee_key: "white", tee_name: "White Tee" },
            { tee_key: "red", tee_name: "Red Tee" }
        ]
    };
    teeSelect.replaceChildren();

    pendingApiCourseDetail.tees.forEach(function (tee, index) {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = tee.tee_name;
        teeSelect.append(option);
    });

    teeGroup.classList.remove("hidden");
    courseSearchMessage.textContent =
        "Verified 27-hole scorecard loaded. Choose your tee and nine combination.";
    selectApiTee();
    teeSelect.focus();
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
    // Translate API field names into the simpler course shape used by this app.
    if (pendingApiCourseDetail === null) {
        return;
    }

    const tee = pendingApiCourseDetail.tees[Number(teeSelect.value)];

    if (tee === undefined) {
        return;
    }

    if (pendingApiCourseDetail.specialCourse === "honekor") {
        const course = courses[`honekor:${tee.tee_key}`];

        courseSelect.value = course.id;
        selectedCourse = course;
        updateRoundFormatOptions();
        updateSelectedCourseCard();
        courseSearchMessage.textContent =
            "Hon-E-Kor is ready. Choose a single nine or an 18-hole combination.";
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
        latitude: Number(pendingApiCourseDetail.lat),
        longitude: Number(pendingApiCourseDetail.lng),
        courseRating: Number.isFinite(Number(tee.course_rating))
            ? Number(tee.course_rating)
            : null,
        slopeRating: Number.isFinite(Number(tee.slope))
            ? Number(tee.slope)
            : null,
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
    updateRoundFormatOptions();
    updateSelectedCourseCard();
    courseSearchMessage.textContent = "Course saved on this device and ready to play.";
}

function editSelectedCourse() {
    const course = courses[courseSelect.value];

    if (!isValidCourse(course) || course.source === "built-in") {
        return;
    }

    showCustomCourse(course);
}

// The same form handles creation (null) and editing (an existing course).
function showCustomCourse(course = null) {
    setupSection.classList.add("hidden");
    historySection.classList.add("hidden");
    statisticsSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    customCourseSection.classList.remove("hidden");
    customCourseMessage.textContent = "";
    customCourseForm.reset();

    if (course === null) {
        editingCourseId = null;
        customCourseSection.querySelector("h2").textContent = "Add Custom Course";
        document.getElementById("save-custom-course-button").textContent = "Save Course";
        customHoleCountSelect.value = "9";
        renderCustomHoleRows();
    } else {
        editingCourseId = course.id;
        customCourseSection.querySelector("h2").textContent = "Edit Course";
        document.getElementById("save-custom-course-button").textContent = "Save Changes";
        customCourseNameInput.value = course.name;
        customTeeNameInput.value = course.teeName || "Default";
        customHoleCountSelect.value = course.holes.length >= 18 ? "18" : "9";
        renderCustomHoleRows();

        Array.from(customHoleList.querySelectorAll(".custom-hole-row"))
            .forEach(function (row, index) {
                const hole = course.holes[index];

                if (hole !== undefined) {
                    row.querySelector(".custom-par-input").value = hole.par;
                    row.querySelector(".custom-yardage-input").value = hole.yardage ?? "";
                }
            });
    }

    customCourseNameInput.focus();
}

function renderCustomHoleRows() {
    // Generate one editable row per hole instead of maintaining 18 HTML copies.
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
    // Prevent the form's normal page reload; validate and save in this browser.
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

    const existingCourse = editingCourseId === null
        ? null
        : courses[editingCourseId];
    const course = {
        ...(existingCourse ?? {}),
        id: editingCourseId ?? `custom:${Date.now()}`,
        name: name,
        teeName: teeName,
        source: existingCourse?.source ?? "custom",
        holes: holes
    };

    saveCourse(course);
    courseSelect.value = course.id;
    selectedCourse = course;
    editingCourseId = null;
    updateRoundFormatOptions();
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

// 7. Active rounds: save a snapshot after each input so navigation loses no work.
function saveActiveRound() {
    if (selectedCourse === null) {
        return;
    }

    const activeRound = {
        courseId: selectedCourse.id ?? courseSelect.value,
        course: selectedCourse,
        currentHoleIndex: currentHoleIndex,
        roundResults: roundResults,
        conditions: roundConditions,
        roundToken: activeRoundToken
    };

    localStorage.setItem(
        ACTIVE_ROUND_KEY,
        JSON.stringify(activeRound)
    );
}

function startRound() {
    const existingRound = localStorage.getItem(ACTIVE_ROUND_KEY);

    if (
        existingRound !== null &&
        getValidSavedRound(existingRound) !== null &&
        !window.confirm("Starting a new round will replace the saved round. Continue?")
    ) {
        return;
    }

    localStorage.removeItem(ACTIVE_ROUND_KEY);

    const selectedCourseId = courseSelect.value;

    const baseCourse = courses[selectedCourseId];

    if (!isValidCourse(baseCourse)) {
        courseSearchMessage.textContent = "Choose a course before starting your round.";
        return;
    }

    const roundSelection = getRoundSelection(baseCourse);
    selectedCourse = {
        ...baseCourse,
        roundFormat: roundSelection.format,
        roundLabel: roundSelection.label,
        holes: roundSelection.holes
    };

    currentHoleIndex = 0;
    roundConditions = null;
    activeRoundToken = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

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
    captureRoundConditions(baseCourse, activeRoundToken);
}

function displayCurrentHole() {
    // Populate controls from saved results, or use par/two putts as starting values.
    const currentHole = selectedCourse.holes[currentHoleIndex];
    const currentResult = roundResults[currentHoleIndex];

    holeNumberText.textContent = currentHole.number;
    holeParText.textContent = currentHole.par;
    holeYardageText.textContent = currentHole.yardage ?? "—";

    holeProgressText.textContent =
        `Hole ${currentHoleIndex + 1} of ${selectedCourse.holes.length}`;

    courseNameText.textContent = selectedCourse.roundLabel
        ? `${selectedCourse.name} · ${selectedCourse.roundLabel}`
        : selectedCourse.name;

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

    renderRoundConditions();
    updateCurrentScore();
}

function saveHoleAndContinue() {
    // Validate before advancing; finishing the last hole creates a history entry.
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
// Draft inputs may be incomplete; strict validation happens on Save & Next.
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

    const savedRound = savedRoundText === null
        ? null
        : getValidSavedRound(savedRoundText);
    const hasSavedRound = savedRound !== null;

    resumeRoundButton.classList.toggle("hidden", !hasSavedRound);
    activeRoundCard.classList.toggle("hidden", !hasSavedRound);

    if (hasSavedRound) {
        const currentHole = savedRound.course.holes[savedRound.currentHoleIndex];
        const details = [
            savedRound.course.name,
            savedRound.course.roundLabel,
            `Next: Hole ${currentHole.number}`
        ].filter(Boolean);
        activeRoundDetails.textContent = details.join(" · ");
    }
}

function getValidSavedRound(savedRoundText) {
    // Parse defensively so old or damaged browser data does not crash startup.
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
    // Restore the course, hole index, scores, and weather from one saved snapshot.
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
    roundConditions = savedRound.conditions ?? null;
    activeRoundToken = savedRound.roundToken ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    if (courses[selectedCourse.id] === undefined) {
        courses[selectedCourse.id] = selectedCourse;
        addCourseOption(selectedCourse);
    }
    courseSelect.value = selectedCourse.id;

    setupSection.classList.add("hidden");
    roundSection.classList.remove("hidden");

    displayCurrentHole();
}

function saveRoundAndGoHome() {
    saveCurrentHoleWithoutValidation();
    saveActiveRound();
    showSetup();
}

function discardSavedRound() {
    if (!window.confirm("Discard the saved round? This cannot be undone.")) {
        return;
    }

    localStorage.removeItem(ACTIVE_ROUND_KEY);
    activeRoundToken = null;
    resumeRoundButton.classList.add("hidden");
    activeRoundCard.classList.add("hidden");
}

function showScorecardOverview() {
    saveCurrentHoleWithoutValidation();
    saveActiveRound();
    scorecardOverviewSubtitle.textContent = [
        selectedCourse.name,
        selectedCourse.teeName,
        selectedCourse.roundLabel
    ].filter(Boolean).join(" · ");
    scorecardOverviewContent.replaceChildren();

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>Yards</th>
                <th>Score</th>
                <th>To Par</th>
            </tr>
        </thead>
    `;
    const body = document.createElement("tbody");

    selectedCourse.holes.forEach(function (hole, index) {
        const result = roundResults[index];
        const row = document.createElement("tr");
        const scoreToPar = result.score === null
            ? "—"
            : formatScoreToPar(result.score - hole.par);
        const values = [
            hole.number,
            hole.par,
            hole.yardage ?? "—",
            result.score ?? "—",
            scoreToPar
        ];

        if (index === currentHoleIndex) {
            row.classList.add("current-scorecard-hole");
        }

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });

        row.title = `Go to hole ${hole.number}`;
        row.addEventListener("click", function () {
            currentHoleIndex = index;
            scorecardOverviewDialog.close();
            displayCurrentHole();
        });
        body.append(row);
    });

    table.append(body);
    scorecardOverviewContent.append(table);
    scorecardOverviewDialog.showModal();
}

// 8. Weather is optional. The token prevents a late response updating a new round.
async function captureRoundConditions(course, roundToken) {
    roundConditionsText.textContent = "Checking current conditions…";

    try {
        const coordinates = await getCourseCoordinates(course);
        const parameters = new URLSearchParams({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            current: [
                "temperature_2m",
                "apparent_temperature",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
                "wind_direction_10m"
            ].join(","),
            temperature_unit: "fahrenheit",
            wind_speed_unit: "mph",
            precipitation_unit: "inch"
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`);

        if (!response.ok) {
            throw new Error(`Weather returned ${response.status}.`);
        }

        const weather = await response.json();

        if (weather.current === undefined) {
            throw new Error("Current conditions were unavailable.");
        }

        if (roundToken !== activeRoundToken) {
            return;
        }

        roundConditions = {
            temperature: Number(weather.current.temperature_2m),
            feelsLike: Number(weather.current.apparent_temperature),
            precipitation: Number(weather.current.precipitation),
            weatherCode: Number(weather.current.weather_code),
            windSpeed: Number(weather.current.wind_speed_10m),
            windDirection: Number(weather.current.wind_direction_10m),
            capturedAt: new Date().toISOString()
        };
        renderRoundConditions();
        saveActiveRound();
    } catch (error) {
        if (roundToken !== activeRoundToken) {
            return;
        }

        console.info("Automatic round conditions were unavailable.", error);
        roundConditionsText.textContent =
            "Conditions unavailable — scoring will continue normally.";
    }
}

function getCourseCoordinates(course) {
    // Prefer known course coordinates; device location requires browser permission.
    if (
        Number.isFinite(course.latitude) &&
        Number.isFinite(course.longitude) &&
        course.latitude !== 0 &&
        course.longitude !== 0
    ) {
        return Promise.resolve({
            latitude: course.latitude,
            longitude: course.longitude
        });
    }

    return new Promise(function (resolve, reject) {
        if (!("geolocation" in navigator)) {
            reject(new Error("Location is not supported."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            reject,
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
    });
}

function renderRoundConditions() {
    if (roundConditions === null) {
        roundConditionsText.textContent = "Checking current conditions…";
        return;
    }

    const windDirection = getCardinalDirection(roundConditions.windDirection);
    roundConditionsText.textContent =
        `${getWeatherLabel(roundConditions.weatherCode)} · ` +
        `${Math.round(roundConditions.temperature)}°F · ` +
        `Wind ${windDirection} ${Math.round(roundConditions.windSpeed)} mph`;
}

function getCardinalDirection(degrees) {
    if (!Number.isFinite(degrees)) {
        return "";
    }

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(degrees / 45) % directions.length];
}

function getWeatherLabel(code) {
    if (code === 0) return "Clear";
    if ([1, 2, 3].includes(code)) return "Cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunderstorms";
    return "Current conditions";
}

function formatConditions(conditions) {
    if (conditions === null || conditions === undefined) {
        return "";
    }

    return (
        `${Math.round(conditions.temperature)}°F, ` +
        `${Math.round(conditions.windSpeed)} mph wind`
    );
}

// 9. Completed history and career filters. Reset changes the date, not scorecards.
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

function getCareerStart() {
    const careerStart = localStorage.getItem(CAREER_START_KEY);

    if (careerStart === null || Number.isNaN(new Date(careerStart).getTime())) {
        return null;
    }

    return careerStart;
}

function getCareerHistory() {
    const history = getRoundHistory();
    const careerStart = getCareerStart();

    if (careerStart === null) {
        return history;
    }

    const startTime = new Date(careerStart).getTime();
    return history.filter(function (round) {
        return new Date(round.completedAt).getTime() >= startTime;
    });
}

function resetCareerStatistics() {
    if (!window.confirm(
        "Start a new career? Your existing rounds will remain in Round History, " +
        "but they will stop counting toward current career statistics."
    )) {
        return;
    }

    if (!window.confirm(
        "Please confirm again: current statistics and personal-best displays " +
        "will restart from zero. No scorecards will be deleted."
    )) {
        return;
    }

    if (window.prompt("Type RESET to start a new career.") !== "RESET") {
        return;
    }

    const currentStart = localStorage.getItem(CAREER_START_KEY);
    localStorage.setItem(
        PREVIOUS_CAREER_START_KEY,
        currentStart ?? "__ALL_ROUNDS__"
    );
    localStorage.setItem(CAREER_START_KEY, new Date().toISOString());
    renderStatistics();
    renderHomeDashboard();
}

function undoCareerReset() {
    const previousStart = localStorage.getItem(PREVIOUS_CAREER_START_KEY);

    if (previousStart === null) {
        return;
    }

    if (!window.confirm("Restore the previous career statistics period?")) {
        return;
    }

    if (previousStart === "__ALL_ROUNDS__") {
        localStorage.removeItem(CAREER_START_KEY);
    } else {
        localStorage.setItem(CAREER_START_KEY, previousStart);
    }

    localStorage.removeItem(PREVIOUS_CAREER_START_KEY);
    renderStatistics();
    renderHomeDashboard();
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
    saveRoundHistory(history);
}

function saveRoundHistory(history) {
    localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(history));

    if (window.golfPythonApi?.enabled) {
        localStorage.setItem(PYTHON_PENDING_KEY, "true");
        const snapshot = JSON.stringify(history);
        pythonSaveQueue = pythonSaveQueue.then(async function () {
            await window.golfPythonApi.replaceRounds(JSON.parse(snapshot));
            // Do not mark later edits as saved when an older request finishes.
            if (localStorage.getItem(ROUND_HISTORY_KEY) === snapshot) {
                localStorage.removeItem(PYTHON_PENDING_KEY);
            }
        }).catch(function (error) {
            // The local copy is still safe if the development server is down.
            console.warn("Rounds could not be copied to the Python API.", error);
        });
    }
}

async function syncRoundsWithPythonBackend() {
    if (!window.golfPythonApi?.enabled) {
        return;
    }

    try {
        const localRounds = getRoundHistory();
        const serverRounds = await window.golfPythonApi.getRounds();

        if (localStorage.getItem(PYTHON_PENDING_KEY) !== null) {
            // Retry local edits before considering any older server snapshot.
            saveRoundHistory(getRoundHistory());
            return;
        }

        if (serverRounds.length === 0 && localRounds.length > 0) {
            // First Python run: seed SQLite with the browser's existing rounds.
            await window.golfPythonApi.replaceRounds(localRounds);
            return;
        }

        if (serverRounds.length > 0) {
            // SQLite is the source of truth while running through FastAPI.
            localStorage.setItem(ROUND_HISTORY_KEY, JSON.stringify(serverRounds));
            renderHomeDashboard();
        }
    } catch (error) {
        // Offline scoring should never depend on the optional Python server.
        console.warn("Using offline round history because Python is unavailable.", error);
    }
}

function deleteCompletedRound(roundId) {
    const round = getRoundHistory().find(function (historyRound) {
        return historyRound.id === roundId;
    });

    if (round === undefined) {
        return;
    }

    if (!window.confirm(
        `Delete the ${formatRoundDate(round.completedAt)} round at ` +
        `${round.courseName}? This cannot be undone.`
    )) {
        return;
    }

    saveRoundHistory(getRoundHistory().filter(function (historyRound) {
        return historyRound.id !== roundId;
    }));
    renderRoundHistory();
    renderHomeDashboard();
}

function showEditCompletedRound(roundId) {
    // Build a temporary edit form; saved history changes only after submission.
    const round = getRoundHistory().find(function (historyRound) {
        return historyRound.id === roundId;
    });

    if (round === undefined) {
        return;
    }

    editingCompletedRoundId = roundId;
    editRoundMessage.textContent = "";
    editRoundSubtitle.textContent = [
        round.courseName,
        round.teeName,
        round.roundLabel ?? `${round.holes.length} Holes`
    ].filter(Boolean).join(" · ");
    editRoundScorecard.replaceChildren();

    const headings = document.createElement("div");
    headings.className = "edit-round-row edit-round-headings";
    ["Hole", "Score", "Putts", "Fairway", "Pen."].forEach(function (label) {
        const heading = document.createElement("strong");
        heading.textContent = label;
        headings.append(heading);
    });
    editRoundScorecard.append(headings);

    round.holes.forEach(function (hole, index) {
        const row = document.createElement("div");
        const holeLabel = document.createElement("strong");
        const score = createEditNumberInput(`Hole ${hole.number} score`, hole.score, 1);
        const putts = createEditNumberInput(`Hole ${hole.number} putts`, hole.putts, 0);
        const fairway = document.createElement("select");
        const penalties = createEditNumberInput(
            `Hole ${hole.number} penalties`,
            hole.penalties,
            0
        );

        row.className = "edit-round-row";
        row.dataset.index = index;
        holeLabel.textContent = `${hole.number} · P${hole.par}`;
        score.className = "edit-score-input";
        putts.className = "edit-putts-input";
        penalties.className = "edit-penalties-input";
        fairway.className = "edit-fairway-input";
        fairway.setAttribute("aria-label", `Hole ${hole.number} fairway`);

        const fairwayOptions = hole.par === 3
            ? [{ value: "na", label: "—" }]
            : [
                { value: "hit", label: "Hit" },
                { value: "left", label: "Left" },
                { value: "right", label: "Right" }
            ];
        fairwayOptions.forEach(function (fairwayOption) {
            const option = document.createElement("option");
            option.value = fairwayOption.value;
            option.textContent = fairwayOption.label;
            fairway.append(option);
        });
        fairway.value = hole.par === 3 ? "na" : hole.fairway;
        row.append(holeLabel, score, putts, fairway, penalties);
        editRoundScorecard.append(row);
    });

    editRoundDialog.showModal();
}

function createEditNumberInput(label, value, minimum) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = String(minimum);
    input.required = true;
    input.value = value;
    input.setAttribute("aria-label", label);
    return input;
}

function saveEditedCompletedRound(event) {
    // Read every row, recalculate totals, then replace the matching history item.
    event.preventDefault();
    const history = getRoundHistory();
    const roundIndex = history.findIndex(function (round) {
        return round.id === editingCompletedRoundId;
    });

    if (roundIndex === -1) {
        editRoundDialog.close();
        return;
    }

    const originalRound = history[roundIndex];
    const rows = Array.from(
        editRoundScorecard.querySelectorAll(".edit-round-row[data-index]")
    );
    const holes = rows.map(function (row, index) {
        const originalHole = originalRound.holes[index];
        return {
            ...originalHole,
            score: Number(row.querySelector(".edit-score-input").value),
            putts: Number(row.querySelector(".edit-putts-input").value),
            fairway: row.querySelector(".edit-fairway-input").value,
            penalties: Number(row.querySelector(".edit-penalties-input").value)
        };
    });

    if (holes.some(function (hole) {
        return (
            !Number.isInteger(hole.score) ||
            hole.score < 1 ||
            !Number.isInteger(hole.putts) ||
            hole.putts < 0 ||
            !Number.isInteger(hole.penalties) ||
            hole.penalties < 0 ||
            (hole.par !== 3 && !["hit", "left", "right"].includes(hole.fairway))
        );
    })) {
        editRoundMessage.textContent = "Enter valid results for every hole.";
        return;
    }

    const totals = calculateCompletedRoundTotals(holes);
    history[roundIndex] = {
        ...originalRound,
        ...totals,
        holes: holes,
        editedAt: new Date().toISOString()
    };
    saveRoundHistory(history);
    editingCompletedRoundId = null;
    editRoundDialog.close();
    renderRoundHistory();
    renderHomeDashboard();
}

function calculateCompletedRoundTotals(holes) {
    // Offline total calculation; Python validates these totals again on receipt.
    const totals = holes.reduce(function (result, hole) {
        result.totalScore += hole.score;
        result.totalPar += hole.par;
        result.totalPutts += hole.putts;
        result.totalPenalties += hole.penalties;

        if (hole.par !== 3) {
            result.fairwayOpportunities++;

            if (hole.fairway === "hit") {
                result.fairwaysHit++;
            }
        }

        return result;
    }, {
        totalScore: 0,
        totalPar: 0,
        totalPutts: 0,
        totalPenalties: 0,
        fairwaysHit: 0,
        fairwayOpportunities: 0
    });

    return {
        ...totals,
        scoreToPar: totals.totalScore - totals.totalPar,
        fairwayPercentage: totals.fairwayOpportunities === 0
            ? 0
            : Math.round((totals.fairwaysHit / totals.fairwayOpportunities) * 100)
    };
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
    checkForSavedRound();
    renderHomeDashboard();
}

function showStatistics() {
    setupSection.classList.add("hidden");
    historySection.classList.add("hidden");
    customCourseSection.classList.add("hidden");
    roundSection.classList.add("hidden");
    statisticsSection.classList.remove("hidden");
    renderStatistics();
}

// 10. Statistics rendering. Use Python online and browser calculations offline.
async function renderStatistics() {
    const history = getCareerHistory();
    const hasRounds = history.length > 0;
    const careerStart = getCareerStart();

    statisticsPeriodLabel.textContent = careerStart === null
        ? "Your performance across every saved round"
        : `Current career started ${formatDateOnly(careerStart)}`;
    careerStartText.textContent = careerStart === null
        ? "Career statistics currently include every completed round."
        : `Current career statistics include rounds since ${formatDateOnly(careerStart)}. ` +
            "Older scorecards remain available in Round History.";
    undoCareerResetButton.classList.toggle(
        "hidden",
        localStorage.getItem(PREVIOUS_CAREER_START_KEY) === null
    );

    emptyStatisticsMessage.classList.toggle("hidden", hasRounds);
    statisticsContent.classList.toggle("hidden", !hasRounds);

    if (!hasRounds) {
        handicapEstimateStat.textContent = "—";
        eligibleDifferentialsStat.textContent = "0";
        return;
    }

    let statistics;
    let handicap;
    try {
        if (!window.golfPythonApi?.enabled) {
            throw new Error("Offline calculation mode");
        }
        statistics = await window.golfPythonApi.calculateStatistics(history);
        handicap = statistics.handicap;
    } catch {
        statistics = calculateStatistics(history);
        handicap = calculateHandicapEstimate(history);
    }
    // A reset/edit during the request makes its result obsolete.
    if (JSON.stringify(history) !== JSON.stringify(getCareerHistory())) {
        return renderStatistics();
    }

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

    handicapEstimateStat.textContent = handicap.value === null
        ? "—"
        : handicap.value.toFixed(1);
    eligibleDifferentialsStat.textContent = handicap.differentialCount;

    bestRoundCourse.textContent = statistics.bestRound.courseName;
    bestRoundDate.textContent =
        `${formatRoundDate(statistics.bestRound.completedAt)} · ` +
        `${statistics.bestRound.holes.length} holes`;
    bestRoundTotal.textContent = statistics.bestRound.totalScore;
    bestRoundToPar.textContent = formatScoreToPar(statistics.bestRound.scoreToPar);

    renderHoleTypeStatistics(statistics.holeTypes);
    renderRecentResults(history.slice(0, 5));
    renderPersonalBests(history);
}

function renderHomeDashboard() {
    // Render instantly from local history, including when Python is unreachable.
    const careerHistory = getCareerHistory();
    const allHistory = getRoundHistory();
    const handicap = calculateHandicapEstimate(careerHistory);
    const bestRound = careerHistory.length === 0
        ? null
        : careerHistory.reduce(function (best, round) {
            return round.scoreToPar < best.scoreToPar ? round : best;
        });

    dashboardCareerRounds.textContent = careerHistory.length;
    dashboardHandicap.textContent = handicap.value === null
        ? `${handicap.differentialCount}/3`
        : handicap.value.toFixed(1);
    dashboardPersonalBest.textContent = bestRound === null
        ? "—"
        : formatScoreToPar(bestRound.scoreToPar);

    const recentRound = allHistory[0];
    homeRecentRound.classList.toggle("hidden", recentRound === undefined);

    if (recentRound !== undefined) {
        homeRecentRoundCourse.textContent = recentRound.courseName;
        homeRecentRoundDetails.textContent = [
            recentRound.teeName,
            recentRound.roundLabel ?? `${recentRound.holes.length} Holes`,
            `${recentRound.totalScore} (${formatScoreToPar(recentRound.scoreToPar)})`,
            formatDateOnly(recentRound.completedAt)
        ].filter(Boolean).join(" · ");
    }

    homeFavoriteCourses.replaceChildren();
    const favoriteCourses = getFavoriteCourseIds()
        .map(function (courseId) {
            return courses[courseId];
        })
        .filter(isValidCourse);
    homeFavoritesSection.classList.toggle("hidden", favoriteCourses.length === 0);

    favoriteCourses.forEach(function (course) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "favorite-course-chip";
        button.textContent = getCourseOptionLabel(course).replace("★ ", "");
        button.addEventListener("click", function () {
            courseSelect.value = course.id;
            selectSavedCourse();
            courseSelect.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        homeFavoriteCourses.append(button);
    });
}

function formatDateOnly(dateText) {
    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
        return "an unknown date";
    }

    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

// Offline equivalent of backend/statistics.py. Keep both algorithms consistent.
function calculateHandicapEstimate(history) {
    const differentials = history
        .slice(0, 20)
        .map(calculateEstimatedDifferential)
        .filter(Number.isFinite)
        .sort(function (first, second) {
            return first - second;
        });
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

    const average = differentials
        .slice(0, usedDifferentials)
        .reduce(function (total, differential) {
            return total + differential;
        }, 0) / usedDifferentials;
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
    const courseRating = isRatedEighteen
        ? round.courseRating
        : round.totalPar * holeFactor;
    const slopeRating = isRatedEighteen ? round.slopeRating : 113;
    const differential = (113 / slopeRating) * (adjustedScore - courseRating);

    return Math.round(differential * 10) / 10;
}

function renderPersonalBests(history) {
    // Each course/tee/nine combination gets its own record rather than one global best.
    const bestByCourse = new Map();

    history.forEach(function (round) {
        const roundLabel = round.roundLabel ?? `${round.holes.length} Holes`;
        const key = [
            round.courseId ?? round.courseName,
            round.teeName ?? "",
            roundLabel
        ].join("|");
        const currentBest = bestByCourse.get(key);

        if (
            currentBest === undefined ||
            round.scoreToPar < currentBest.scoreToPar ||
            (
                round.scoreToPar === currentBest.scoreToPar &&
                round.totalScore < currentBest.totalScore
            )
        ) {
            bestByCourse.set(key, round);
        }
    });

    personalBests.replaceChildren();

    Array.from(bestByCourse.values())
        .sort(function (first, second) {
            return first.courseName.localeCompare(second.courseName);
        })
        .forEach(function (round) {
            const row = document.createElement("div");
            const details = document.createElement("div");
            const course = document.createElement("strong");
            const labels = document.createElement("span");
            const score = document.createElement("strong");

            row.className = "personal-best-row";
            course.textContent = round.courseName;
            labels.textContent = [
                round.teeName,
                round.roundLabel ?? `${round.holes.length} Holes`
            ].filter(Boolean).join(" · ");
            score.className = "personal-best-score";
            score.textContent = `${round.totalScore} (${formatScoreToPar(round.scoreToPar)})`;
            details.append(course, labels);
            row.append(details, score);
            personalBests.append(row);
        });
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
    // Compare strokes over par per hole to account for different round lengths.
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
    // Show separate 9H and 18H labels so mixed rounds do not create misleading averages.
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

// 11. DOM builders: textContent inserts text safely, including course names.
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
    completedDate.textContent = [
        round.teeName,
        round.roundLabel,
        formatConditions(round.conditions),
        formatRoundDate(round.completedAt)
    ]
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

    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    actions.className = "history-card-actions";
    editButton.type = "button";
    editButton.className = "small-secondary-button";
    editButton.textContent = "Edit Scorecard";
    editButton.setAttribute("aria-label", `Edit ${round.courseName} scorecard`);
    editButton.addEventListener("click", function () {
        showEditCompletedRound(round.id);
    });
    deleteButton.type = "button";
    deleteButton.className = "small-danger-button";
    deleteButton.textContent = "Delete Round";
    deleteButton.setAttribute("aria-label", `Delete ${round.courseName} round`);
    deleteButton.addEventListener("click", function () {
        deleteCompletedRound(round.id);
    });
    actions.append(editButton, deleteButton);

    card.append(heading, stats, scorecard, actions);
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
    // Build table cells as text nodes so imported course data cannot become HTML.
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

// 12. Finalize: add hole totals, store the scorecard, then clear the active draft.
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
        roundFormat: selectedCourse.roundFormat ?? "all",
        roundLabel: selectedCourse.roundLabel ?? `${selectedCourse.holes.length} Holes`,
        conditions: roundConditions,
        courseRating: selectedCourse.courseRating ?? null,
        slopeRating: selectedCourse.slopeRating ?? null,
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
    activeRoundToken = null;
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
