// Run: node --test tests/round-statistics.test.js
// Node's built-in test tools need no npm packages or frontend build system.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const math = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, "round-statistics.js"), "utf8"), math);

function makeRound(count, extraScore = 0) {
    const holes = [];
    for (let index = 0; index < count; index++) {
        holes.push({par: 4, score: 4 + extraScore, putts: 2, penalties: 0, fairway: "hit"});
    }
    return Object.assign({holes: holes}, math.calculateCompletedRoundTotals(holes));
}

test("totals include scores once and exclude par-3 fairways", function () {
    const totals = math.calculateCompletedRoundTotals([
        {par: 3, score: 5, putts: 2, penalties: 1, fairway: "hit"},
        {par: 4, score: 4, putts: 1, penalties: 0, fairway: "left"}
    ]);
    assert.equal(totals.totalScore, 9);
    assert.equal(totals.totalPutts, 3);
    assert.equal(totals.totalPenalties, 1);
    assert.equal(totals.scoreToPar, 2);
    assert.equal(totals.fairwayOpportunities, 1);
    assert.equal(totals.fairwaysHit, 0);
});

test("empty statistics and totals are safe", function () {
    assert.equal(math.calculateStatistics([]).bestRound, null);
    assert.equal(math.calculateStatistics([]).averageScore, null);
    assert.equal(math.calculateCompletedRoundTotals([]).fairwayPercentage, 0);
});

test("length groups and best-round tie breaking stay separate", function () {
    const nine = makeRound(9);
    const eighteen = makeRound(18);
    const stats = math.calculateStatistics([eighteen, nine]);
    assert.equal(stats.roundLengths[9].totalScore, 36);
    assert.equal(stats.roundLengths[18].totalScore, 72);
    assert.equal(stats.bestRound, nine);
    assert.equal(math.calculateStatistics([nine, makeRound(9)]).bestRound, nine);
});

test("handicap keeps twenty rounds, filters invalid data, and does not mutate input", function () {
    const rounds = [];
    for (let index = 0; index < 20; index++) rounds.push(makeRound(9, 1));
    rounds.push(makeRound(9, -3));
    const before = JSON.stringify(rounds);
    assert.equal(math.calculateHandicapEstimate(rounds).value, 18);
    assert.equal(math.calculateHandicapEstimate(rounds).usedDifferentials, 8);
    assert.equal(JSON.stringify(rounds), before);
    assert.equal(math.calculateHandicapEstimate([{holes: []}]).differentialCount, 0);
    assert.equal(math.calculateHandicapEstimate([makeRound(9), makeRound(9), makeRound(9)]).value, -2);
});

test("rated eighteen uses slope and course rating", function () {
    const round = makeRound(18, 1);
    round.courseRating = 72;
    round.slopeRating = 113;
    assert.equal(math.calculateEstimatedDifferential(round), 18);
});

test("HTML and offline cache load the calculation dependency", function () {
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.ok(html.indexOf('src="round-statistics.js"') < html.indexOf('src="script.js"'));
    const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
    assert.ok(worker.includes('"./round-statistics.js"'));
});
