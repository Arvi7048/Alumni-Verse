@echo off
echo ========================================
echo   Alumni Platform - Local Deployment
echo ========================================
echo.

echo [1/6] Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

echo [2/6] Installing dependencies...
call npm run install-all
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo [3/6] Checking environment file...
if not exist "backend\.env" (
    echo ⚠️  Environment file not found!
    echo Creating backend\.env file...
    (
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo MONGO_URI=mongodb://127.0.0.1:27017/alumni-platform
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-alumni-platform-2024
        echo.
        echo # File Upload Configuration
        echo MAX_FILE_SIZE=5242880
    ) > backend\.env
    echo ✅ Environment file created
    echo ⚠️  Please review and update backend\.env if needed
) else (
    echo ✅ Environment file exists
)
echo.

echo [4/6] Creating uploads directory...
if not exist "backend\uploads" (
    mkdir backend\uploads
    echo ✅ Uploads directory created
) else (
    echo ✅ Uploads directory exists
)
echo.

echo [5/6] Checking MongoDB...
echo ⚠️  Please ensure MongoDB is running:
echo    - Start MongoDB service: mongod
echo    - Or use MongoDB Atlas (cloud)
echo.

echo [6/6] Ready to start application!
echo.
echo ========================================
echo   Deployment Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start MongoDB (mongod)
echo 2. Seed database: npm run seed
echo 3. Start application: npm run dev-full
echo    OR start separately:
echo    - Backend: npm run server
echo    - Frontend: npm run client
echo.
echo Access points:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
echo - Health Check: http://localhost:5000/api/health
echo.
echo Test credentials:
echo - Admin: admin@alumnihub.com / admin123
echo - User: john.smith@email.com / password123
echo.
pause 