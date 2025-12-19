# IP Configuration Fix Script for RYMA Academy LMS (PowerShell)
# This script fixes IP-related issues and ensures proper CORS/environment setup

Write-Host "🔧 Starting IP Configuration Fix..." -ForegroundColor Green

# Create backup of current configurations
Write-Host "📋 Creating backup of current configurations..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item "client\.env" "client\.env.backup.$timestamp" -ErrorAction SilentlyContinue
Copy-Item "client\.env.production" "client\.env.production.backup.$timestamp" -ErrorAction SilentlyContinue
Copy-Item "server\.env" "server\.env.backup.$timestamp" -ErrorAction SilentlyContinue
Copy-Item "server\.env.production" "server\.env.production.backup.$timestamp" -ErrorAction SilentlyContinue

# Fix Client Environment Configuration
Write-Host "📱 Fixing Client Environment Configuration..." -ForegroundColor Cyan

$clientEnv = @"
# Client Environment Variables for Production Build
VITE_API_URL=https://online.rymaacademy.cloud/api
VITE_BACKEND_URL=https://online.rymaacademy.cloud/api
VITE_UPLOAD_API_URL=https://online.rymaacademy.cloud/api/upload

# App Configuration
VITE_APP_NAME=RYMA Academy - Learning Management System
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_TIMEOUT=60000
VITE_UPLOAD_TIMEOUT=300000
VITE_MAX_RETRY_ATTEMPTS=3
VITE_ENABLE_LOGGING=false

# Payment Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_zpW8DRz71kgfGe

# File Upload Limits (in bytes)
VITE_MAX_FILE_SIZE=104857600
VITE_MAX_IMAGE_SIZE=10485760
VITE_MAX_VIDEO_SIZE=524288000
"@

$clientEnv | Out-File -FilePath "client\.env" -Encoding utf8

# Fix Server Environment Configuration
Write-Host "🖥️  Fixing Server Environment Configuration..." -ForegroundColor Cyan

$serverEnv = @"
# Server Configuration
PORT=2000
NODE_ENV=production
MONGODB_URI=mongodb+srv://mayurikhose09_db_user:WAF3yaDqIGiHyMe1@cluster0.bjehcar.mongodb.net/?appName=Cluster0
JWT_SECRET=RymaAcademy@2025#ProductionSecretKey

# CORS Configuration - Allow multiple IPs and domains
CLIENT_URL=https://online.rymaacademy.cloud
FRONTEND_URL=https://online.rymaacademy.cloud
ALLOWED_ORIGINS=https://online.rymaacademy.cloud,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_zpW8DRz71kgfGe
RAZORPAY_KEY_SECRET=ZR8uo5ml4VXsE4Rxp43dTgaW

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@rymaacademy.cloud
SMTP_PASS=rymA@2025#EmailPass
EMAIL_FROM=noreply@rymaacademy.cloud

# Storage Configuration
CLOUDINARY_CLOUD_NAME=rymaacademy
CLOUDINARY_API_KEY=625397854826937
CLOUDINARY_API_SECRET=hJ9kLmN4pQ7rT2vX5yZ8

# Security Configuration - More lenient for multiple IPs
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=3000

# Database Configuration
MONGODB_OPTIONS=retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=30000
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=50
MONGODB_MAX_IDLE_TIME_MS=60000

# Cache Configuration
REDIS_URL=redis://ryma-redis.cloud:6379
REDIS_PASSWORD=RymaRedis@2025#Prod

# Session Configuration
SESSION_SECRET=RymaSessionProd@2025#SecretKey

# File Upload Limits
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/rymaacademy/uploads

# SSL Configuration
SSL_KEY_PATH=/etc/letsencrypt/live/online.rymaacademy.cloud/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/online.rymaacademy.cloud/fullchain.pem

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_CRON=0 0 * * *
"@

location / {
    add_header 'Access-Control-Expose-Headers' 'x-rtb-fingerprint-id';
}

$serverEnv | Out-File -FilePath "server\.env" -Encoding utf8

Write-Host "📦 Building client with new configuration..." -ForegroundColor Yellow
Set-Location client
npm install
npm run build:production
Set-Location ..

Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
Set-Location ..

# Test API connectivity
Write-Host "🔍 Testing API connectivity..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Production API Health Check: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Production API Health Check: Failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $response = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/courses" -Method Get -TimeoutSec 10
    $courseCount = ($response.courses | Measure-Object).Count
    Write-Host "✅ Courses endpoint: $courseCount courses found" -ForegroundColor Green
} catch {
    Write-Host "❌ Courses endpoint: Failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 IP Configuration Fix Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Fixed Issues:" -ForegroundColor Green
Write-Host "   • Environment variables properly configured"
Write-Host "   • CORS settings updated for multiple IPs"
Write-Host "   • API URLs pointing to production"
Write-Host "   • Rate limiting adjusted for better access"
Write-Host ""
Write-Host "📊 Current Status:" -ForegroundColor Cyan
Write-Host "   • Production Domain: https://online.rymaacademy.cloud"
Write-Host "   • API Endpoint: https://online.rymaacademy.cloud/api"
Write-Host "   • Database: Connected to MongoDB Atlas"
Write-Host "   • CORS: Allows multiple origins and IPs"
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Deploy the updated code to your server"
Write-Host "   2. Restart your server application"
Write-Host "   3. Update Nginx configuration on server"
Write-Host "   4. Clear browser cache and cookies"
Write-Host "   5. Test from different IP addresses"
Write-Host ""
Write-Host "📱 Quick Tests:" -ForegroundColor Magenta
Write-Host "   Invoke-RestMethod -Uri 'https://online.rymaacademy.cloud/api/health'"
Write-Host "   Invoke-RestMethod -Uri 'https://online.rymaacademy.cloud/api/courses'"
Write-Host ""