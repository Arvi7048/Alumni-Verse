# Alumni Platform - Local Deployment Script
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Alumni Platform - Local Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow
try {
    npm run install-all
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check environment file
Write-Host "[3/6] Checking environment file..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Environment file not found!" -ForegroundColor Yellow
    Write-Host "Creating backend\.env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/alumni-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-alumni-platform-2024

# File Upload Configuration
MAX_FILE_SIZE=5242880
"@
    
    $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Environment file created" -ForegroundColor Green
    Write-Host "⚠️  Please review and update backend\.env if needed" -ForegroundColor Yellow
} else {
    Write-Host "✅ Environment file exists" -ForegroundColor Green
}

Write-Host ""

# Create uploads directory
Write-Host "[4/6] Creating uploads directory..." -ForegroundColor Yellow
if (-not (Test-Path "backend\uploads")) {
    New-Item -ItemType Directory -Path "backend\uploads" -Force | Out-Null
    Write-Host "✅ Uploads directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Uploads directory exists" -ForegroundColor Green
}

Write-Host ""

# MongoDB check
Write-Host "[5/6] Checking MongoDB..." -ForegroundColor Yellow
Write-Host "⚠️  Please ensure MongoDB is running:" -ForegroundColor Yellow
Write-Host "   - Start MongoDB service: mongod" -ForegroundColor White
Write-Host "   - Or use MongoDB Atlas (cloud)" -ForegroundColor White

Write-Host ""

# Ready to start
Write-Host "[6/6] Ready to start application!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deployment Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Start MongoDB (mongod)" -ForegroundColor White
Write-Host "2. Seed database: npm run seed" -ForegroundColor White
Write-Host "3. Start application: npm run dev-full" -ForegroundColor White
Write-Host "   OR start separately:" -ForegroundColor White
Write-Host "   - Backend: npm run server" -ForegroundColor White
Write-Host "   - Frontend: npm run client" -ForegroundColor White
Write-Host ""

Write-Host "Access points:" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "- Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "- Health Check: http://localhost:5000/api/health" -ForegroundColor Green
Write-Host ""

Write-Host "Test credentials:" -ForegroundColor White
Write-Host "- Admin: admin@alumnihub.com / admin123" -ForegroundColor Cyan
Write-Host "- User: john.smith@email.com / password123" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to continue" 