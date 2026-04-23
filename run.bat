@echo off
title StressBlock - Dev Server
color 0A

echo ========================================
echo        StressBlock - Quick Launch
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Download it from: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node -v

:: Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo.
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed.
) else (
    echo [OK] Dependencies already installed.
)

echo.
echo ========================================
echo   Starting dev server...
echo   Press Ctrl+C to stop.
echo ========================================
echo.

call npm run dev
pause
