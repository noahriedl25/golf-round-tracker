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

from .database import RoundDatabase
from .models import CompletedRound
from .statistics import round_summary


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
    return {"status": "ok"}


@app.get("/api/rounds")
def list_rounds() -> list[dict]:
    return database.list_rounds()


@app.post("/api/rounds", status_code=status.HTTP_201_CREATED)
def create_round(round_data: CompletedRound) -> dict:
    browser_json = round_data.as_browser_json()
    database.save_round(browser_json)
    return browser_json


@app.put("/api/rounds/{round_id}")
def update_round(round_id: str, round_data: CompletedRound) -> dict:
    if round_id != round_data.id:
        raise HTTPException(status_code=400, detail="Round IDs do not match")
    browser_json = round_data.as_browser_json()
    database.save_round(browser_json)
    return browser_json


@app.delete("/api/rounds/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_round(round_id: str) -> Response:
    if not database.delete_round(round_id):
        raise HTTPException(status_code=404, detail="Round not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.put("/api/rounds")
def replace_rounds(rounds: list[CompletedRound]) -> dict[str, int]:
    browser_rounds = [round_data.as_browser_json() for round_data in rounds]
    database.replace_rounds(browser_rounds)
    return {"saved": len(browser_rounds)}


@app.get("/api/statistics")
def get_statistics() -> dict:
    rounds = [CompletedRound.model_validate(item) for item in database.list_rounds()]
    return round_summary(rounds)


# Define this last because it handles every non-API URL, including index.html.
app.mount("/", StaticFiles(directory=PROJECT_ROOT, html=True), name="frontend")
