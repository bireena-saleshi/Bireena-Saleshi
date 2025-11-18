# Bireena Bakery Quick Start Script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Bireena Bakery Management System  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq 'Running') {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "! Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name MongoDB
        Write-Host "✓ MongoDB started" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ MongoDB service not found. Please install MongoDB or start it manually." -ForegroundColor Red
    Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting Bireena Bakery Server..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Default Login - Username: admin, Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm start
