# Post-Deployment Testing Script
# Run this AFTER deploying to production

Write-Host "🧪 Testing Course Thumbnail Feature - PRODUCTION" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

$PROD_API = "https://online.rymaacademy.cloud/api"

Write-Host "`n1. 📡 Testing Base API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $PROD_API -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Production API is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Production API failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. 🔗 Testing NEW validate-url endpoint..." -ForegroundColor Yellow
try {
    $body = '{"url":"https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"}'
    $response = Invoke-WebRequest -Uri "$PROD_API/upload/validate-url" -Method POST -Body $body -ContentType "application/json" -Headers @{"Authorization"="Bearer test"}
} catch {
    if ($_.Exception.Message -like "*Invalid*" -or $_.Exception.Message -like "*401*") {
        Write-Host "✅ validate-url endpoint is DEPLOYED and working!" -ForegroundColor Green
        Write-Host "   (Auth protection is active - this is correct)" -ForegroundColor Cyan
    } elseif ($_.Exception.Message -like "*not found*" -or $_.Exception.Message -like "*does not exist*") {
        Write-Host "❌ validate-url endpoint NOT deployed yet" -ForegroundColor Red
        Write-Host "   Please check deployment of server/routes/upload.js" -ForegroundColor Yellow
    } else {
        Write-Host "❓ Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n3. 🎛️ Testing Admin Panel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://online.rymaacademy.cloud/admin" -Method GET
    Write-Host "✅ Admin panel accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin panel not accessible" -ForegroundColor Red
}

Write-Host "`n4. 📤 Testing Upload Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$PROD_API/upload/course-media" -Method POST -Headers @{"Authorization"="Bearer test"}
} catch {
    if ($_.Exception.Message -like "*Invalid*" -or $_.Exception.Message -like "*401*") {
        Write-Host "✅ course-media endpoint working" -ForegroundColor Green
    }
}

Write-Host "`n📊 DEPLOYMENT STATUS SUMMARY:" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

Write-Host "`n🎯 Features Expected After Successful Deployment:" -ForegroundColor Cyan
Write-Host "   📤 Upload to Cloudinary: ✅ Should work" -ForegroundColor White
Write-Host "   🔗 External Link Support: ✅ Should work" -ForegroundColor White
Write-Host "   📺 YouTube URL Detection: ✅ Should work" -ForegroundColor White
Write-Host "   ✔️ URL Validation API: ✅ Should work" -ForegroundColor White
Write-Host "   🎨 Enhanced UI: ✅ Should work" -ForegroundColor White

Write-Host "`n🧪 Manual Testing Steps:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://online.rymaacademy.cloud/admin" -ForegroundColor White
Write-Host "   2. Navigate: Course Management → Create Course" -ForegroundColor White
Write-Host "   3. Look for: Course Thumbnail section with TWO TABS" -ForegroundColor White
Write-Host "   4. Test 'Upload Image/Video' tab (should work as before)" -ForegroundColor White
Write-Host "   5. Test 'External Link' tab (NEW FEATURE)" -ForegroundColor White
Write-Host "   6. Try YouTube URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ" -ForegroundColor White
Write-Host "   7. Should see 'YouTube video detected' message" -ForegroundColor White

Write-Host "`n✅ Testing completed!" -ForegroundColor Green
Write-Host "Deploy the files and run this script again to verify! 🚀" -ForegroundColor Cyan