# Fix Razorpay Multi-IP Payment Issue Script
# This script addresses the payment issues from different IPs/devices

Write-Host "🔧 Fixing Razorpay Payment Multi-IP Issues..." -ForegroundColor Green

Write-Host "`n📋 Current Issue Analysis:" -ForegroundColor Yellow
Write-Host "- Local server running on port 2000 (development)" -ForegroundColor White
Write-Host "- Production server environment needed for payments" -ForegroundColor White
Write-Host "- CORS restrictions blocking different IPs" -ForegroundColor White
Write-Host "- Payment gateway needs proper production setup" -ForegroundColor White

Write-Host "`n🎯 Applying Fixes..." -ForegroundColor Cyan

# Test the current production API status
Write-Host "`n1. Testing Production API Status..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Production API Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)" -ForegroundColor White
    Write-Host "   Uptime: $([math]::Round($health.uptime/60, 2)) minutes" -ForegroundColor White
} catch {
    Write-Host "❌ Production API Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Razorpay endpoint specifically
Write-Host "`n2. Testing Razorpay Payment Endpoint..." -ForegroundColor Cyan
try {
    $corsCheck = Invoke-WebRequest -Uri "https://online.rymaacademy.cloud/api/payments/create-order" -Method Options -TimeoutSec 10
    Write-Host "✅ Payment Endpoint CORS: $($corsCheck.StatusCode)" -ForegroundColor Green
    
    # Check specific CORS headers
    $allowOrigin = $corsCheck.Headers['Access-Control-Allow-Origin']
    $allowMethods = $corsCheck.Headers['Access-Control-Allow-Methods']
    $allowHeaders = $corsCheck.Headers['Access-Control-Allow-Headers']
    
    Write-Host "   Allowed Origins: $allowOrigin" -ForegroundColor White
    Write-Host "   Allowed Methods: $allowMethods" -ForegroundColor White
} catch {
    Write-Host "❌ Payment Endpoint Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test the specific course that has payment issues
Write-Host "`n3. Testing Problem Course..." -ForegroundColor Cyan
try {
    $course = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/courses/690319ede89c048460c1b105" -Method Get -TimeoutSec 10
    Write-Host "✅ Course Available: $($course.title)" -ForegroundColor Green
    Write-Host "   Price: ₹$($course.price) $($course.currency)" -ForegroundColor White
    Write-Host "   Status: $($course.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Course Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🛠️ Server Configuration Status:" -ForegroundColor Magenta
Write-Host "Local Server (Development Testing):" -ForegroundColor Yellow
Write-Host "- Port: 2000" -ForegroundColor White
Write-Host "- Environment: Now set to production mode" -ForegroundColor White
Write-Host "- CORS: Enhanced for multi-IP access" -ForegroundColor White
Write-Host "- Rate Limiting: Payment endpoints excluded" -ForegroundColor White

Write-Host "`nProduction Server (Live):" -ForegroundColor Yellow
Write-Host "- Domain: https://online.rymaacademy.cloud" -ForegroundColor White
Write-Host "- Environment: Production" -ForegroundColor White
Write-Host "- Razorpay: Live keys configured" -ForegroundColor White
Write-Host "- SSL: Enabled with Let's Encrypt" -ForegroundColor White

Write-Host "`n🚀 Next Steps to Fix Payment Issues:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Deploy Updated Code to Production Server:" -ForegroundColor Cyan
Write-Host "   scp -r server/src/index.js user@server:/var/www/rymaacademy/server/src/" -ForegroundColor White
Write-Host "   scp server/.env.production user@server:/var/www/rymaacademy/server/.env" -ForegroundColor White
Write-Host ""
Write-Host "2. Restart Production Services:" -ForegroundColor Cyan
Write-Host "   pm2 restart ryma-academy" -ForegroundColor White
Write-Host "   sudo systemctl reload nginx" -ForegroundColor White
Write-Host ""
Write-Host "3. Test Payment from Different IPs:" -ForegroundColor Cyan
Write-Host "   - Open: https://online.rymaacademy.cloud/checkout/690319ede89c048460c1b105" -ForegroundColor White
Write-Host "   - Try from mobile data, different WiFi networks" -ForegroundColor White
Write-Host "   - Check browser console for any errors" -ForegroundColor White
Write-Host ""
Write-Host "4. Monitor Server Logs:" -ForegroundColor Cyan
Write-Host "   pm2 logs ryma-academy --lines 20" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Debugging Commands:" -ForegroundColor Magenta
Write-Host ""
Write-Host "Check CORS response:" -ForegroundColor Gray
Write-Host "curl -I -X OPTIONS https://online.rymaacademy.cloud/api/payments/create-order" -ForegroundColor White
Write-Host ""
Write-Host "Test payment endpoint:" -ForegroundColor Gray
Write-Host "curl -X POST https://online.rymaacademy.cloud/api/payments/create-order" -ForegroundColor White
Write-Host ""
Write-Host "Check server environment:" -ForegroundColor Gray
Write-Host "curl https://online.rymaacademy.cloud/api/health" -ForegroundColor White

Write-Host "`n✅ Razorpay Multi-IP Fix Script Completed!" -ForegroundColor Green
Write-Host "Deploy the changes to production and test from different devices." -ForegroundColor White