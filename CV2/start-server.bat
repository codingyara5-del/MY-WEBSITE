@echo off
REM Start a local HTTP server for the interactive science experiments
REM This ensures all resources (including Three.js and related libraries) load correctly

echo Starting local HTTP server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when done.
echo.

cd /d "%~dp0"

python -m http.server 8000

REM If Python is not available, try Node.js http-server
if errorlevel 1 (
    echo Python not found. Trying Node.js http-server...
    http-server -p 8000
)

REM If neither works, inform the user
if errorlevel 1 (
    echo.
    echo ERROR: Neither Python nor Node.js http-server is installed.
    echo.
    echo Please install one of the following:
    echo - Python: https://www.python.org/
    echo - Node.js: https://nodejs.org/
    echo.
    echo Or manually open the project directory and use:
    echo - VS Code: Right-click index.html ^> Open with Live Server
    echo - Any browser: Then navigate to http://localhost:8000
    pause
)
