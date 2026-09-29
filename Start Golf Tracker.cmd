@echo off
rem Run from this folder, even when launched by double-clicking in Explorer.
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" run.py
) else (
    where py >nul 2>nul
    if errorlevel 1 (
        where python >nul 2>nul
        if errorlevel 1 (
            echo Install Python 3.11 or newer, then double-click this file again.
        ) else (
            python run.py
        )
    ) else (
        py -3 run.py
    )
)
pause
