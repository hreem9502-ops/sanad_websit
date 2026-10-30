@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" backend_flask\app.py
) else (
    python backend_flask\app.py
)
pause
