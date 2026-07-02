#!/bin/bash

# SK Agriculture Parts - Quick Start Script
# For Linux and macOS

echo ""
echo "======================================"
echo "  SK Agriculture Parts - Quick Start"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Node.js version:"
node -v
echo ""

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL not found"
    echo "Make sure MySQL is running and accessible"
fi
echo ""

# Backend Setup
echo "[3/5] Setting up Backend..."
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install backend dependencies"
        exit 1
    fi
else
    echo "Backend dependencies already installed"
fi
echo ""

# Frontend Setup
echo "[4/5] Setting up Frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "Frontend dependencies already installed"
fi
echo ""

# Validation
echo "[5/5] Validating project..."
node validate.js
if [ $? -ne 0 ]; then
    exit 1
fi

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Ready to start development!"
echo ""
echo "Run these commands in separate terminal windows:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
