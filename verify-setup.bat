@echo off
REM HirQube Setup Verification Script
echo.
echo ============================================================
echo  HirQube Setup Verification
echo ============================================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
  echo ✅ Node.js installed: 
  node --version
) else (
  echo ❌ Node.js NOT found. Please install Node.js v18+
  exit /b 1
)

REM Check npm
echo.
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
  echo ✅ npm installed: 
  npm --version
) else (
  echo ❌ npm NOT found
  exit /b 1
)

REM Check Git
echo.
echo Checking Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
  echo ✅ Git installed: 
  git --version
) else (
  echo ⚠️  Git NOT found (optional but recommended)
)

REM Check backend dependencies
echo.
echo Checking backend dependencies...
if exist backend\node_modules (
  echo ✅ Backend dependencies installed
) else (
  echo ⚠️  Backend dependencies not installed
  echo    Run: cd backend ^&^& npm install
)

REM Check frontend dependencies
echo.
echo Checking frontend dependencies...
if exist frontend\node_modules (
  echo ✅ Frontend dependencies installed
) else (
  echo ⚠️  Frontend dependencies not installed
  echo    Run: cd frontend ^&^& npm install
)

REM Check backend .env
echo.
echo Checking backend configuration...
if exist backend\.env (
  echo ✅ backend\.env exists
  REM Check if it has real values (not just defaults)
  findstr /r "your_" backend\.env >nul 2>&1
  if %errorlevel% equ 0 (
    echo ⚠️  backend\.env still has placeholder values
    echo    Please update with your actual API keys
  ) else (
    echo ✅ API keys appear to be configured
  )
) else (
  echo ❌ backend\.env NOT found
  echo    Copy backend\.env.example to backend\.env and fill in your keys
)

REM Check MongoDB connection
echo.
echo Checking MongoDB connectivity...
echo (This may take a moment...)
cd backend
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 3000}).then(() => {console.log('✅ MongoDB connection successful'); process.exit(0);}).catch(() => {console.log('❌ MongoDB connection failed - check your MONGODB_URI'); process.exit(1);});" 2>nul
if %errorlevel% equ 0 (
  REM echo MongoDB check passed
) else (
  echo ❌ Could not connect to MongoDB
)
cd ..

echo.
echo ============================================================
echo  Summary
echo ============================================================
echo.
echo To complete setup:
echo.
echo 1. Update backend\.env with your API keys:
echo    - ADZUNA_API_ID and ADZUNA_API_KEY
echo    - LOGODEV_API_KEY
echo    - MONGODB_URI
echo.
echo 2. Install dependencies:
echo    cd backend && npm install
echo    cd ../frontend && npm install
echo.
echo 3. Start backend:
echo    cd backend && npm run dev
echo.
echo 4. Start frontend (in new terminal):
echo    cd frontend && npm start
echo.
echo 5. View in browser:
echo    http://localhost:3000
echo.
echo ============================================================

pause
