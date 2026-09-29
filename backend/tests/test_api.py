"""Exercise real HTTP requests with a disposable database, never personal data."""

import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from backend.tests.test_statistics import make_even_par_round


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        # Ask the OS for an available port rather than assuming 8000 is free.
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        cls.base_url = f"http://127.0.0.1:{port}"
        environment = os.environ.copy()
        environment["GOLF_TRACKER_DATABASE"] = str(Path(cls.directory.name) / "test.db")
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.app:app", "--port", str(port)],
            cwd=Path(__file__).resolve().parents[2], env=environment,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        for attempt in range(50):
            try:
                with urlopen(cls.base_url + "/api/health", timeout=1):
                    return
            except (URLError, TimeoutError):
                time.sleep(0.1)
        cls.server.terminate()
        cls.server.wait()
        cls.directory.cleanup()
        raise RuntimeError("Test server did not start")

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate()
        cls.server.wait(timeout=10)
        cls.directory.cleanup()

    def test_preview_calculates_without_saving(self):
        rounds = [make_even_par_round(i).as_browser_json() for i in range(1, 4)]
        request = Request(
            self.base_url + "/api/statistics/preview",
            data=json.dumps(rounds).encode(),
            headers={"Content-Type": "application/json"}, method="POST",
        )
        with urlopen(request) as response:
            result = json.load(response)
        self.assertEqual(result["handicap"]["value"], -2)
        self.assertEqual(result["totalRounds"], 3)
        with urlopen(self.base_url + "/api/rounds") as response:
            self.assertEqual(json.load(response), [])

    def test_only_public_files_are_served(self):
        with urlopen(self.base_url + "/") as response:
            self.assertIn(b"Golf Round Tracker", response.read())
        for path in ("/backend/app.py", "/.git/config", "/backend/data/golf_tracker.db"):
            with self.assertRaises(HTTPError) as error:
                urlopen(self.base_url + path)
            self.assertEqual(error.exception.code, 404)
