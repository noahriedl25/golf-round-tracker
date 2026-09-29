"""Small SQLite data-access layer.

The complete round is stored as JSON because scorecards naturally contain a
list of holes.  The ID and completion date are separate columns so SQLite can
quickly locate and sort rounds without knowing every detail of the scorecard.
"""

import json
import sqlite3
from pathlib import Path
from typing import Any


class RoundDatabase:
    """Own the path, but open a fresh connection for each operation."""
    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._create_tables()

    def _connect(self) -> sqlite3.Connection:
        # SQLite connections cannot be shared freely between request threads.
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _create_tables(self) -> None:
        connection = self._connect()
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS rounds (
                    id TEXT PRIMARY KEY,
                    completed_at TEXT NOT NULL,
                    round_json TEXT NOT NULL
                )
                """
            )
            connection.commit()
        finally:
            connection.close()

    def list_rounds(self) -> list[dict[str, Any]]:
        """Decode each saved JSON document back into a Python dictionary."""
        connection = self._connect()
        try:
            rows = connection.execute(
                "SELECT round_json FROM rounds ORDER BY completed_at DESC"
            ).fetchall()
        finally:
            connection.close()
        return [json.loads(row["round_json"]) for row in rows]

    def save_round(self, round_data: dict[str, Any]) -> None:
        """Insert a new round or replace the data for a matching ID."""
        # Question marks bind values safely; never join user text into SQL.
        connection = self._connect()
        try:
            connection.execute(
                """
                INSERT INTO rounds (id, completed_at, round_json)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    completed_at = excluded.completed_at,
                    round_json = excluded.round_json
                """,
                (
                    round_data["id"],
                    round_data["completedAt"],
                    json.dumps(round_data),
                ),
            )
            connection.commit()
        finally:
            connection.close()

    def delete_round(self, round_id: str) -> bool:
        """Return whether a row was deleted, letting the route choose 204/404."""
        connection = self._connect()
        try:
            cursor = connection.execute(
                "DELETE FROM rounds WHERE id = ?", (round_id,)
            )
            deleted = cursor.rowcount > 0
            connection.commit()
            return deleted
        finally:
            connection.close()

    def replace_rounds(self, rounds: list[dict[str, Any]]) -> None:
        """Replace the saved history in one transaction.

        This matches how the existing offline app stores one history list in
        localStorage and keeps the first Python integration easy to follow.
        """

        connection = self._connect()
        try:
            connection.execute("DELETE FROM rounds")
            # Nothing is permanent until commit. close() rolls back on failure.
            connection.executemany(
                """
                INSERT INTO rounds (id, completed_at, round_json)
                VALUES (?, ?, ?)
                """,
                [
                    (
                        round_data["id"],
                        round_data["completedAt"],
                        json.dumps(round_data),
                    )
                    for round_data in rounds
                ],
            )
            connection.commit()
        finally:
            connection.close()
