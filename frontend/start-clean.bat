@echo off
title Translation Frontend - Auto Setup
color 0B
echo.
echo ╔════════════════════════════════════════╗
echo ║   Cleaning up and starting app...      ║
echo ╚════════════════════════════════════════╝
echo.

REM Kill any process on port 3000
echo Clearing port 3000...
netstat -ano | findstr :3000 > nul && (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    echo Port 3000 cleared!
) || echo Port 3000 is free

REM Wait a moment
timeout /t 2 /nobreak

REM Start the app
echo.
echo Starting frontend on port 3000...
set PORT=3000
npm start

pause