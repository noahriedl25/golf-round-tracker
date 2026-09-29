"""Start the tracker: python run.py (or use Start Golf Tracker.cmd on Windows).

The launcher uses only Python's standard library until the project environment
is ready. Dependencies stay in .venv instead of modifying your system Python.
"""

import argparse
from pathlib import Path
import subprocess
import sys
import venv


ROOT = Path(__file__).resolve().parent
ENVIRONMENT = ROOT / ".venv"


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Golf Round Tracker locally")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--test", action="store_true", help="Run the Python tests")
    args = parser.parse_args()

    # On the first run, build an isolated environment using this Python version.
    python = ENVIRONMENT / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    if not python.exists():
        print("Creating the project's Python environment...", flush=True)
        venv.EnvBuilder(with_pip=True).create(ENVIRONMENT)

    # Install only when needed. Repeated launches work without an Internet link.
    check = subprocess.run(
        [str(python), "-c", "import fastapi, pydantic, uvicorn"],
        capture_output=True,
    )
    if check.returncode != 0:
        print("Installing dependencies (Internet required for the first run)...", flush=True)
        subprocess.run(
            [str(python), "-m", "pip", "install", "-r", str(ROOT / "backend/requirements.txt")],
            check=True,
        )

    if args.test:
        command = [str(python), "-m", "unittest", "discover", "-s", "backend/tests", "-v"]
    else:
        print(f"\nOpen http://127.0.0.1:{args.port} in your browser.", flush=True)
        print("Leave this window open. Press Ctrl+C to stop the server.\n", flush=True)
        command = [str(python), "-m", "uvicorn", "backend.app:app",
                   "--host", "127.0.0.1", "--port", str(args.port)]
    try:
        result = subprocess.run(command, cwd=ROOT)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        print("\nTracker stopped. Saved rounds remain in the database.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, subprocess.CalledProcessError) as error:
        print(f"Could not start the tracker: {error}")
        print("Check your Internet connection for first-time setup and try again.")
        sys.exit(1)
