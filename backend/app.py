"""FastAPI application for Golf Round Tracker.

Run from the project root with:

    uvicorn backend.app:app --reload

Then open http://127.0.0.1:8000.  FastAPI serves both the existing frontend
and the new JSON API, so there is no separate frontend setup step.
"""

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import RoundDatabase
from .models import CompletedRound
from .statistics import round_summary, dashboard_statistics


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE = PROJECT_ROOT / "backend" / "data" / "golf_tracker.db"
DATABASE_PATH = Path(os.getenv("GOLF_TRACKER_DATABASE", DEFAULT_DATABASE))

app = FastAPI(
    title="Golf Round Tracker API",
    version="1.0.0",
    description="Stores completed rounds and calculates career statistics.",
)
database = RoundDatabase(DATABASE_PATH)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Let a client check that the Python server is running."""
    return {"status": "ok"}


@app.get("/api/rounds")
def list_rounds() -> list[dict]:
    """Read saved scorecards, newest first."""
    return database.list_rounds()


@app.post("/api/rounds", status_code=status.HTTP_201_CREATED)
def create_round(round_data: CompletedRound) -> dict:
    """Pydantic validates the request before this function runs."""
    browser_json = round_data.as_browser_json()
    database.save_round(browser_json)
    return browser_json


@app.put("/api/rounds/{round_id}")
def update_round(round_id: str, round_data: CompletedRound) -> dict:
    """Save an edited scorecard under its existing ID."""
    if round_id != round_data.id:
        raise HTTPException(status_code=400, detail="Round IDs do not match")
    browser_json = round_data.as_browser_json()
    database.save_round(browser_json)
    return browser_json


@app.delete("/api/rounds/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_round(round_id: str) -> Response:
    """Return 404 if the requested scorecard does not exist."""
    if not database.delete_round(round_id):
        raise HTTPException(status_code=404, detail="Round not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.put("/api/rounds")
def replace_rounds(rounds: list[CompletedRound]) -> dict[str, int]:
    """Save one browser's history atomically; this is a single-user app."""
    browser_rounds = []
    for round_data in rounds:
        browser_rounds.append(round_data.as_browser_json())
    database.replace_rounds(browser_rounds)
    return {"saved": len(browser_rounds)}


@app.get("/api/statistics")
def get_statistics() -> dict:
    rounds = []
    for saved_round in database.list_rounds():
        validated_round = CompletedRound.model_validate(saved_round)
        rounds.append(validated_round)
    return round_summary(rounds)


@app.post("/api/statistics/preview")
def preview_statistics(rounds: list[CompletedRound]) -> dict:
    """Calculate the selected career without changing stored scorecards.

    The browser sends its current snapshot so unsaved edits and career resets
    are reflected immediately, even while a database save is still pending.
    """
    return dashboard_statistics(rounds)


# Serve only public assets. Serving the entire project would expose the
# SQLite database, Python source, and Git files through ordinary web URLs.
PUBLIC_FILES = {
    "index.html", "script.js", "api-client.js", "style.css",
    "service-worker.js", "manifest.webmanifest", "nearby-courses.js",
    "round-statistics.js",
}
app.mount("/icons", StaticFiles(directory=PROJECT_ROOT / "icons"), name="icons")


@app.get("/")
def home() -> FileResponse:
    return FileResponse(PROJECT_ROOT / "index.html")


@app.get("/{filename}")
def public_file(filename: str) -> FileResponse:
    if filename not in PUBLIC_FILES:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(PROJECT_ROOT / filename)
