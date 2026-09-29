# Golf Round Tracker

A web application that helps golfers analyze their rounds and identify where they lose strokes.

## Current Features

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

Python 3.11 or newer is recommended.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.app:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). API documentation is
available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Run the Python tests with:

```powershell
python -m unittest discover -s backend\tests -v
```

## Python Code Guide

- `backend/app.py` defines the API routes and serves the frontend.
- `backend/models.py` validates the scorecard data received from JavaScript.
- `backend/database.py` contains the small SQLite data-access layer.
- `backend/statistics.py` contains pure calculation functions.
- `backend/tests/` contains examples showing how the calculations behave.

## Install on a Phone

The tracker is a Progressive Web App. After it is hosted over HTTPS, open it
on your phone and add it to the home screen. Open it once while online so the
app files are available during an offline round.
