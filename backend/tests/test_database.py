import tempfile
import unittest
import sqlite3
from pathlib import Path

from backend.database import RoundDatabase


def sample_round(round_id: str) -> dict:
    return {
        "id": round_id,
        "completedAt": "2026-09-29T12:00:00Z",
        "courseName": "Practice Course",
    }


class RoundDatabaseTests(unittest.TestCase):
    def test_failed_replace_preserves_existing_history(self) -> None:
        self.database.save_round(sample_round("original"))
        with self.assertRaises(sqlite3.IntegrityError):
            self.database.replace_rounds([sample_round("duplicate"), sample_round("duplicate")])
        self.assertEqual(self.database.list_rounds()[0]["id"], "original")

    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        database_path = Path(self.temporary_directory.name) / "test.db"
        self.database = RoundDatabase(database_path)

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_save_and_list_round(self) -> None:
        self.database.save_round(sample_round("round-1"))
        self.assertEqual(self.database.list_rounds()[0]["id"], "round-1")

    def test_replace_rounds_removes_old_data(self) -> None:
        self.database.save_round(sample_round("old-round"))
        self.database.replace_rounds([sample_round("new-round")])
        self.assertEqual(
            [item["id"] for item in self.database.list_rounds()],
            ["new-round"],
        )

    def test_delete_reports_if_round_existed(self) -> None:
        self.database.save_round(sample_round("round-1"))
        self.assertTrue(self.database.delete_round("round-1"))
        self.assertFalse(self.database.delete_round("missing-round"))


if __name__ == "__main__":
    unittest.main()
