# Understanding the tracker

This is a single-user learning project. You should be able to follow one round
from a button click to its database entry. Start with the following files.

1. `run.py` starts the server and prepares the Python environment.
2. `backend/models.py` describes a hole and a completed round.
3. `backend/statistics.py` does the math using loops, lists, and dictionaries.
4. `backend/database.py` reads and writes scorecards using parameterized SQL.
5. `backend/app.py` connects HTTP requests to these functions.
6. `api-client.js` sends browser requests to those Python routes.
7. `round-statistics.js` contains pure browser calculations; `script.js` handles
   buttons, screens, course selection, and calls those calculations.
8. `index.html` defines the controls; `style.css` defines their appearance.
9. `service-worker.js` caches public app files for offline use.

## Follow a saved round

## Page navigation

Home (`home-section`) shows the dashboard, resume action, and favorites.
Courses (`setup-section`) contains search and round setup. Career
(`statistics-section`) contains statistics, history access, and collapsed
career settings. These are separate views in one HTML document, not separate
server routes. `showPage` hides the other views, updates navigation state,
focuses the heading, and saves a draft when leaving an active scoring view.
`showSetup` is the legacy name for returning Home; `showCourses` opens course
selection. Phone navigation is fixed at the bottom; desktop navigation is above
the page. Do not remove the draft-existence check: completed-round summaries
must not recreate a draft when the player navigates away.

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

### Connections to your Java and Python coursework

`HoleResult` and `CompletedRound` represent domain objects, like the bee and
flower classes in your garden lab. `backend/app.py` handles incoming requests
and delegates work, similar to keeping simulation behavior out of a JavaFX
controller. `RoundDatabase` owns persistence; statistics functions own math.

The backend uses explicit loops to accumulate totals and build lists and
dictionaries. `find_best_round` performs a linear scan with an explicit
tie-breaker. `completion_date` is a named sorting key, similar to specifying
which field a Java comparator sorts by. Sorting returns a new list, leaving
the caller's history order unchanged.

Some library syntax is intentionally retained: `Field` declares validation
and JSON aliases; `@model_validator` asks Pydantic to recalculate totals after
checking the input. This Python decorator registers a function with a library;
it is not the object-oriented Decorator pattern from the garden assignment.
Type hints such as `list[CompletedRound]` resemble Java generic types, while
`CompletedRound | None` says that a result may be absent.

The API, validation, SQL parameter binding, transactions, and ordered browser
saves remain in place. They protect data and should not be removed merely to
reduce the number of concepts in the project.

- A **dictionary** groups named values; a **list** holds multiple holes/rounds.
- A **model** validates incoming values before they reach database code.
- An **alias** translates Python's `total_score` to JavaScript's `totalScore`.
- A **pure function** calculates a result without changing files or global state.
- A **route** connects a URL and method (GET/POST/PUT/DELETE) to a Python function.
- A **transaction** ensures a partially failed save cannot erase existing rounds.
- `finally` closes SQLite connections even when an operation fails.
- `await` lets JavaScript wait for a network response without freezing the page.

## Running and limitations

Browser calculation tests run with `node --test tests/round-statistics.test.js`.
They use Node's built-in tools, not npm dependencies. `round-statistics.js` has
no DOM, network, or storage dependencies, so it can be tested without a browser.
Its `for...of` loops correspond to Java enhanced for loops. Ordinary objects
store named totals like Python dictionaries. The file must load before
`script.js`; it is also included in the service-worker cache and API allowlist.

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
