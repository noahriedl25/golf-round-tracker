# Understanding the tracker

This is a single-user learning project. You should be able to follow one round
from a button click to its database entry. Start with the following files.

1. `run.py` starts the server and prepares the Python environment.
2. `backend/models.py` describes a hole and a completed round.
3. `backend/statistics.py` does the math using loops, lists, and dictionaries.
4. `backend/database.py` reads and writes scorecards using parameterized SQL.
5. `backend/app.py` connects HTTP requests to these functions.
6. `api-client.js` sends browser requests to those Python routes.
7. `script.js` handles buttons, screens, course selection, and offline scoring.
8. `index.html` defines the controls; `style.css` defines their appearance.
9. `service-worker.js` caches public app files for offline use.

## Follow a saved round

The Finish Round button calls `finishRound()` in JavaScript. That function
combines hole results into a scorecard. `saveRoundHistory()` writes it to
localStorage immediately, then queues a copy for the Python API if enabled.
FastAPI validates the JSON using `CompletedRound`. The database writes the
entire history in one transaction: all rows save, or the transaction rolls back.

The pending flag remains set until the latest copy succeeds. If Python is
unavailable, the browser keeps your changes and retries on reload. This is a
single-browser development workflow, not multi-user conflict resolution.

## Follow the statistics screen

`renderStatistics()` selects the rounds in the current career and posts that
snapshot to `/api/statistics/preview`. Python groups nine-hole and eighteen-hole
rounds separately, counts fairways, compares best rounds, and estimates handicap.
The response contains plain JSON; JavaScript formats those values on the page.
The preview route calculates only: it never modifies the database.

If Python is unavailable, the equivalent JavaScript calculations keep the
statistics screen usable. The home dashboard also uses these immediate local
calculations. GitHub Pages runs this browser-only path because it cannot host
a Python process.

## Concepts to learn from the implementation

- A **dictionary** groups named values; a **list** holds multiple holes/rounds.
- A **model** validates incoming values before they reach database code.
- An **alias** translates Python's `total_score` to JavaScript's `totalScore`.
- A **pure function** calculates a result without changing files or global state.
- A **route** connects a URL and method (GET/POST/PUT/DELETE) to a Python function.
- A **transaction** ensures a partially failed save cannot erase existing rounds.
- `finally` closes SQLite connections even when an operation fails.
- `await` lets JavaScript wait for a network response without freezing the page.

## Running and limitations

Double-click `Start Golf Tracker.cmd` on Windows, or run `python run.py`.
Run `python run.py --test` to exercise storage and calculations.
Use `python run.py --port 8001` if another program uses port 8000.
Open the printed URL; stop the server with Ctrl+C.

The database is `backend/data/golf_tracker.db` (excluded from Git). Back it up
while the server is stopped. The API has no login and is intended for local use.
Course search and weather still require Internet access. The browser's storage
belongs to its exact address: GitHub Pages, localhost, and 127.0.0.1 do not share
rounds automatically. Career reset settings and custom courses stay in that
browser. Two devices or browser tabs editing together can overwrite each other.

## Practicing ownership of the code

Read a function, predict its output, then run its test. Try adding a statistic
yourself and explain why its denominator matters (rounds, holes, or fairways).
Describe your contribution and AI assistance accurately when discussing the
project. Understanding the implementation is more useful than making the code
look artificially inexperienced.
