@echo off
title Hirna - Enable Windows Geolocation Service (lfsvc)
echo ============================================================
echo   HIRNA LOCATION REPAIR TOOL
echo   Enabling Windows Geolocation Service (lfsvc)
echo ============================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Administrator privileges required. Requesting elevation...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo [*] Setting Geolocation Service (lfsvc) Startup Type to Manual...
sc config lfsvc start= demand

echo [*] Starting Geolocation Service (lfsvc)...
net start lfsvc

echo.
echo ============================================================
echo [SUCCESS] Windows Geolocation Service (lfsvc) is now RUNNING!
echo.
echo You can now:
echo 1. Open Google Chrome.
echo 2. Go to your Hirna page (http://localhost:8000).
echo 3. Click "Allow" or "Retry / Allow".
echo ============================================================
echo.
pause
