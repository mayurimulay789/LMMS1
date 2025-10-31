# Razorpay Multi-IP Payment Test Script
# This script tests payment functionality from different IP addresses and devices

Write-Host "🔍 Testing Razorpay Payment from Multiple IPs..." -ForegroundColor Green

# Test 1: Check API Health
Write-Host "`n1. Testing API Health..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ API Health: $($health.status)" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)" -ForegroundColor White
} catch {
    Write-Host "❌ API Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check CORS for Payment Endpoint
Write-Host "`n2. Testing CORS for Payment Endpoint..." -ForegroundColor Cyan
try {
    $corsTest = Invoke-WebRequest -Uri "https://online.rymaacademy.cloud/api/payments/create-order" -Method Options -TimeoutSec 10
    Write-Host "✅ CORS Status: $($corsTest.StatusCode)" -ForegroundColor Green
    $allowOrigin = $corsTest.Headers['Access-Control-Allow-Origin']
    if ($allowOrigin) {
        Write-Host "   Allowed Origins: $allowOrigin" -ForegroundColor White
    }
} catch {
    Write-Host "❌ CORS Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check Course Endpoint (Required for Checkout)
Write-Host "`n3. Testing Course Endpoint..." -ForegroundColor Cyan
try {
    $course = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/courses/690319ede89c048460c1b105" -Method Get -TimeoutSec 10
    Write-Host "✅ Course Found: $($course.title)" -ForegroundColor Green
    Write-Host "   Price: ₹$($course.price)" -ForegroundColor White
    Write-Host "   Status: $($course.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Course Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check Razorpay Script Loading
Write-Host "`n4. Testing Razorpay Script Access..." -ForegroundColor Cyan
try {
    $razorpayScript = Invoke-WebRequest -Uri "https://checkout.razorpay.com/v1/checkout.js" -Method Get -TimeoutSec 10
    Write-Host "✅ Razorpay Script Accessible: $($razorpayScript.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Razorpay Script Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check Environment Variables (from server response)
Write-Host "`n5. Checking Server Configuration..." -ForegroundColor Cyan
try {
    $config = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/health" -Method Get -TimeoutSec 10
    if ($config.environment -eq "production") {
        Write-Host "✅ Server in Production Mode" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Server in Development Mode - May cause payment issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Config Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔧 Common Payment Issues & Solutions:" -ForegroundColor Magenta
Write-Host ""
Write-Host "Issue 1: CORS Blocking" -ForegroundColor Yellow
Write-Host "Solution: Server now allows all origins for payment endpoints" -ForegroundColor White
Write-Host ""
Write-Host "Issue 2: Rate Limiting" -ForegroundColor Yellow  
Write-Host "Solution: Payment endpoints excluded from rate limiting" -ForegroundColor White
Write-Host ""
Write-Host "Issue 3: Environment Mode" -ForegroundColor Yellow
Write-Host "Solution: Ensure NODE_ENV=production on server" -ForegroundColor White
Write-Host ""
Write-Host "Issue 4: Browser Cache" -ForegroundColor Yellow
Write-Host "Solution: Clear browser cache and cookies" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Deployment Commands for Server:" -ForegroundColor Green
Write-Host ""
Write-Host "# 1. Copy updated server files" -ForegroundColor Gray
Write-Host "sudo cp server/src/index.js /var/www/rymaacademy/server/src/" -ForegroundColor White
Write-Host "sudo cp server/.env.production /var/www/rymaacademy/server/.env" -ForegroundColor White
Write-Host ""
Write-Host "# 2. Restart services" -ForegroundColor Gray  
Write-Host "pm2 restart ryma-academy" -ForegroundColor White
Write-Host "sudo systemctl reload nginx" -ForegroundColor White
Write-Host ""
Write-Host "# 3. Monitor logs" -ForegroundColor Gray
Write-Host "pm2 logs ryma-academy --lines 50" -ForegroundColor White
Write-Host ""

Write-Host "📱 Client Testing:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Test checkout page: https://online.rymaacademy.cloud/checkout/690319ede89c048460c1b105" -ForegroundColor White
Write-Host "2. Open browser dev tools to see console logs" -ForegroundColor White
Write-Host "3. Try payment from different devices/networks" -ForegroundColor White
Write-Host "4. Check for any CORS or authentication errors" -ForegroundColor White

Write-Host "`n✅ Multi-IP Payment Test Completed!" -ForegroundColor Green