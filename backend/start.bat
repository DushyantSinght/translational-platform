@echo off
title Translation Backend Server
color 0A
echo.
echo ╔════════════════════════════════════════╗
echo ║   Starting Translation Backend...      ║
echo ╚════════════════════════════════════════╝
echo.
echo Checking dependencies...
npm list express axios cors >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    npm install express axios cors
)
echo.
echo Starting server on port 5000...
echo Keep this window open while using the app!
echo.
node server.js
pause