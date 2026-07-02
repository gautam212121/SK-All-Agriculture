@echo off
REM SK Agriculture Parts - Quick Start Script
REM This script helps you set up and run the project locally

echo.
echo ======================================
echo  SK Agriculture Parts - Quick Start
echo ======================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking Node.js version...
for /f "tokens=*" %%i in ('node -v') do echo Node.js version: %%i
echo.

REM Check MySQL
echo [2/5] Checking MySQL...
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: MySQL not found in PATH
    echo Make sure MySQL is running and accessible
)
echo.

REM Backend Setup
echo [3/5] Setting up Backend...
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
echo.

REM Frontend Setup
echo [4/5] Setting up Frontend...
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
echo.

REM Validation
echo [5/5] Validating project...
node validate.js
if %ERRORLEVEL% NEQ 0 (
    pause
    exit /b 1
)

echo.
echo ======================================
echo  Setup Complete!
echo ======================================
echo.
echo Ready to start development!
echo.
echo Run these commands in separate terminal windows:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
