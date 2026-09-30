# Golf Round Tracker

A web application that helps golfers analyze their rounds and identify where they lose strokes.

## Learn how everything works

The browser's pure scoring/statistics functions are in `round-statistics.js`;
`script.js` handles UI workflows. Run their tests with
`node --test tests/round-statistics.test.js` (no npm install needed).
The current refactor notes are in [CODE_GUIDE.md](docs/CODE_GUIDE.md).

Read the [developer reference PDF](output/pdf/golf-tracker-explained.pdf)
for file responsibilities, architecture, API and storage contracts, maintenance
notes, and a JavaScript function index. Its editable source is
[COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md).


## Current Features

### Use it on your phone

Open **https://noahriedl25.github.io/golf-round-tracker/** on your phone.
No Python setup or running computer is needed for this hosted version.

- iPhone: Safari → Share → Add to Home Screen.
- Android: Chrome menu → Install app (or Add to Home screen).
- Open online once and save the course you want before playing offline.
- Use **Find courses near me** to search a U.S. ZIP code or tap **Use My Location**.
  Choose 10, 25, or 50 miles. ZIP distances start at the ZIP area's center.
  The first 50 results are shown; reduce the radius if needed.
- Search and weather need internet. Scoring, saved courses, history, editing,
  statistics, and career reset work on the phone without Python.
- Rounds remain in this browser/device. The phone and local Python version do
  not automatically share data. Do not clear site data if you want to keep rounds.

The home screen includes these installation instructions under a collapsible help item.
ZIP coordinates are supplied by [Zippopotam.us](https://www.zippopotam.us/).
Nearby course search is supplied by [OpenGolfAPI](https://www.opengolfapi.org/docs/).

- Track a round one hole at a time
- Record scores, putts, fairways, and penalties
- Automatically save and resume an active round
- Save completed rounds and view hole-by-hole history
- Review scoring, putting, fairway, penalty, and recent-form statistics
- Install the tracker on a phone and use it offline
- Search U.S. golf courses and automatically load available tee scorecards
- Save searched courses on the device or create custom 9- and 18-hole courses
- Play a full 18-hole round or choose the front or back nine
- Favorite and edit saved courses
- Save an in-progress round, return home, and resume later
- View an in-round scorecard and course-specific personal bests
- Automatically record current temperature and wind when location is available
- Play Hon-E-Kor's Red, White, or Blue nine, including every ordered 18-hole pairing
- Start a new statistics career without deleting older scorecards
- Edit or delete completed rounds from Round History
- View a World Handicap System-inspired estimate from recent rounds
- Use a home dashboard for active rounds, favorites, recent results, and career progress

Course and scorecard search data is provided by
[OpenGolfAPI](https://opengolfapi.org/) under the ODbL 1.0 license.
Current round conditions are provided by [Open-Meteo](https://open-meteo.com/).
Hon-E-Kor's three-nine configuration is verified against the
[official course details](https://hon-e-kor.com/course-details-rates/) and its
public combination scorecards.

The handicap shown in the tracker is an unofficial estimate. Rated 18-hole
rounds use stored Course Rating and Slope Rating; unrated and nine-hole rounds
use a par-based approximation. Use an authorized golf association for an
official Handicap Index.

## Built With

- HTML
- CSS
- JavaScript
- Python
- FastAPI
- SQLite

## Why the Project Uses Both JavaScript and Python

The browser-facing parts remain in JavaScript because score entry, offline
storage, phone installation, and future GPS features run in the browser.
The optional Python backend provides:

- validated round data models
- permanent SQLite round storage
- REST endpoints for creating, editing, listing, and deleting rounds
- reusable career-statistics and handicap-estimate calculations

The GitHub Pages version still works entirely offline with `localStorage`.
When the project is run through FastAPI, completed rounds are synchronized to
SQLite as well. This local-first design means losing a network connection does
not interrupt a round.

## Run the Python Version Locally

On Windows, double-click **Start Golf Tracker.cmd** in this folder.
It starts the server and prints the address to open. Keep its window open while
using the app. First-time setup needs Python 3.11+ and Internet access; later
launches reuse the project's `.venv` environment.

Or run this command from the project folder:

```powershell
python run.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). API documentation is
available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Run the Python tests with:

```powershell
python run.py --test
```

## Python Code Guide

Start with [the plain-language code walkthrough](docs/CODE_GUIDE.md).
It explains how a button click becomes a database record, what each file does,
and which features still need JavaScript for offline use.

The statistics screen now calls Python when available. The home dashboard and
offline screens retain local calculations. Pending database writes retry on
reload; this local single-user version does not implement multi-device sync.

- `backend/app.py` defines the API routes and serves the frontend.
- `backend/models.py` validates the scorecard data received from JavaScript.
- `backend/database.py` contains the small SQLite data-access layer.
- `backend/statistics.py` contains pure calculation functions.
- `backend/tests/` contains examples showing how the calculations behave.

## Install on a Phone

The tracker is a Progressive Web App. After it is hosted over HTTPS, open it
on your phone and add it to the home screen. Open it once while online so the
app files are available during an offline round.
