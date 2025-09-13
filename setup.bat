@echo off
REM QuickBird Setup Script for Windows
REM This script sets up the development environment for the QuickBird project

echo 🚀 Setting up QuickBird Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is required but not installed.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is required but not installed.
    exit /b 1
)

echo [INFO] All requirements satisfied!
echo.

REM Setup Backend
echo [INFO] Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo [INFO] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating .env file...
    copy env.example .env
    echo [WARNING] Please update .env file with your API keys and configuration.
)

REM Initialize Alembic
if not exist "alembic\versions" (
    echo [INFO] Initializing database migrations...
    alembic init alembic
)

REM Create initial migration
echo [INFO] Creating initial database migration...
alembic revision --autogenerate -m "Initial migration"

REM Run migrations
echo [INFO] Running database migrations...
alembic upgrade head

cd ..
echo [INFO] Backend setup complete!
echo.

REM Setup Frontend
echo [INFO] Setting up frontend...
cd frontend

REM Install dependencies
echo [INFO] Installing Node.js dependencies...
npm install

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo [INFO] Creating .env.local file...
    copy env.example .env.local
    echo [WARNING] Please update .env.local file with your configuration.
)

REM Build the project
echo [INFO] Building frontend...
npm run build

cd ..
echo [INFO] Frontend setup complete!
echo.

echo [INFO] 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update your .env files with API keys and configuration
echo 2. Start the development servers:
echo    - Backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo    - Frontend: cd frontend ^&^& npm run dev
echo 3. Or use Docker: docker-compose up
echo.
echo Access the application:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.

pause