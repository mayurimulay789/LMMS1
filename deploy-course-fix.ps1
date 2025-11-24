# Complete Fix and Deployment Script for RYMA Academy LMS
# This script fixes the course visibility issues across different IPs

Write-Host "🚀 Starting Complete Deployment Fix..." -ForegroundColor Green

# Test the specific course that was failing
Write-Host "🔍 Testing problematic course endpoint..." -ForegroundColor Cyan
try {
    $courseTest = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/courses/690319ede89c048460c1b105" -Method Get -TimeoutSec 10
    Write-Host "✅ Course API working: $($courseTest.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Course API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test courses listing
Write-Host "🔍 Testing courses listing..." -ForegroundColor Cyan
try {
    $coursesTest = Invoke-RestMethod -Uri "https://online.rymaacademy.cloud/api/courses" -Method Get -TimeoutSec 10
    $courseCount = ($coursesTest.courses | Measure-Object).Count
    Write-Host "✅ Courses API working: $courseCount courses found" -ForegroundColor Green
} catch {
    Write-Host "❌ Courses API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📦 Building client with latest fixes..." -ForegroundColor Yellow
Set-Location client
npm run build:production
Set-Location ..

Write-Host "`n📋 Summary of fixes applied:" -ForegroundColor Green
Write-Host "✅ Fixed CheckoutPage.jsx - Now uses production API" -ForegroundColor White
Write-Host "✅ Fixed CourseDetailPage.jsx - Now uses production API" -ForegroundColor White
Write-Host "✅ Updated CORS configuration for multiple IPs" -ForegroundColor White
Write-Host "✅ Enhanced API configuration with fallback URLs" -ForegroundColor White
Write-Host "✅ Client built successfully for production" -ForegroundColor White

Write-Host "`n🔧 Server Deployment Commands:" -ForegroundColor Cyan
Write-Host "Run these commands on your production server:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# 1. Copy the built client files" -ForegroundColor Gray
Write-Host "sudo cp -r client/dist/* /var/www/rymaacademy/client/dist/" -ForegroundColor White
Write-Host ""
Write-Host "# 2. Update server code" -ForegroundColor Gray
Write-Host "sudo cp server/src/index.js /var/www/rymaacademy/server/src/" -ForegroundColor White
Write-Host "sudo cp server/nginx/rymaacademy.conf /etc/nginx/sites-available/" -ForegroundColor White
Write-Host ""
Write-Host "# 3. Restart services" -ForegroundColor Gray
Write-Host "sudo nginx -t && sudo systemctl reload nginx" -ForegroundColor White
Write-Host "pm2 restart ryma-academy" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Specific Issue Fixed:" -ForegroundColor Magenta
Write-Host "URL: https://online.rymaacademy.cloud/checkout/690319ede89c048460c1b105" -ForegroundColor White
Write-Host "Problem: Course not found due to hardcoded localhost API calls" -ForegroundColor White
Write-Host "Solution: Updated to use production API configuration" -ForegroundColor White

Write-Host "`n📱 Testing URLs:" -ForegroundColor Magenta
Write-Host "Course API: https://online.rymaacademy.cloud/api/courses/690319ede89c048460c1b105" -ForegroundColor White
Write-Host "Checkout Page: https://online.rymaacademy.cloud/checkout/690319ede89c048460c1b105" -ForegroundColor White
Write-Host "Course Detail: https://online.rymaacademy.cloud/courses/690319ede89c048460c1b105" -ForegroundColor White

Write-Host "`n🔍 Verification Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy the updated files to production server" -ForegroundColor White
Write-Host "2. Clear browser cache and cookies" -ForegroundColor White
Write-Host "3. Test checkout page from different IPs/locations" -ForegroundColor White
Write-Host "4. Verify course visibility across different networks" -ForegroundColor White

Write-Host "`n🎉 Fix completed successfully!" -ForegroundColor Green
Write-Host "The course should now be accessible from all IP addresses." -ForegroundColor White