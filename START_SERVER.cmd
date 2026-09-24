@echo off
setlocal enabledelayedexpansion
title HIRNA Mobility Solutions - Server Launcher
cd /d "%~dp0"

echo ======================================================================
echo    HIRNA MOBILITY SOLUTIONS - CROSS-PLATFORM SYSTEM LAUNCHER
echo ======================================================================
echo Checking Python runtime environment...

set "PY_CMD="

:: 1. Check standard 'python'
where python >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_CMD=python"
    goto :run_py
)

:: 2. Check Windows Python launcher 'py'
where py >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_CMD=py -3"
    goto :run_py
)

:: 3. Check AppData local user Python installations
for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
    if exist "%%D\python.exe" (
        set "PY_CMD="%%D\python.exe""
        goto :run_py
    )
)

:: 4. Check Program Files
for /d %%D in ("%ProgramFiles%\Python3*") do (
    if exist "%%D\python.exe" (
        set "PY_CMD="%%D\python.exe""
        goto :run_py
    )
)

:run_py
if defined PY_CMD (
    echo [+] Python detected: !PY_CMD!
    echo [+] Starting HIRNA Local Microservice Daemon...
    !PY_CMD! run_server.py
    if %errorlevel% neq 0 (
        echo.
        echo [!] Python server stopped or encountered an issue.
        echo [*] Launching Hirna Platform directly in default browser...
        start "" "main.html"
    )
) else (
    echo.
    echo [!] Notice: Python was not detected in PATH on this device.
    echo [*] Hirna TNVS Web Platform is 100%% client-portable.
    echo [*] Opening 'main.html' directly in your default browser...
    start "" "main.html"
    echo.
    echo Tip: To enable the optional native Windows notifications background daemon,
    echo      install Python 3 from https://www.python.org and re-run this script.
    echo.
)

pause
