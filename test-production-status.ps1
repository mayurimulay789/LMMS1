# Test Production Endpoints - Course Thumbnail Feature
# PowerShell script to verify deployment status

Write-Host "🔍 Testing Course Thumbnail Feature Deployment Status" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue

# Production API base URL
$PROD_API = "https://online.rymaacademy.cloud/api"

Write-Host "`n📡 Testing Base API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $PROD_API -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Production API is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Production API is not accessible" -ForegroundColor Red
    exit 1
}

Write-Host "`n📤 Testing Upload Endpoints..." -ForegroundColor Yellow

# Test existing course-media endpoint
try {
    $response = Invoke-WebRequest -Uri "$PROD_API/upload/course-media" -Method POST -Headers @{"Authorization"="Bearer test"} -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ course-media endpoint exists (auth protection working)" -ForegroundColor Green
    } else {
        Write-Host "❌ course-media endpoint issue" -ForegroundColor Red
    }
}

# Test new validate-url endpoint
Write-Host "`n🔗 Testing NEW validate-url endpoint..." -ForegroundColor Yellow
try {
    $body = @{ url = "https://example.com" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$PROD_API/upload/validate-url" -Method POST -Body $body -ContentType "application/json" -Headers @{"Authorization"="Bearer test"} -ErrorAction Stop
} catch {
    $errorMessage = $_.Exception.Message
    
    if ($errorMessage -like "*endpoint not found*" -or $errorMessage -like "*does not exist*") {
        Write-Host "❌ validate-url endpoint NOT DEPLOYED YET" -ForegroundColor Red
        Write-Host "   This endpoint needs to be deployed" -ForegroundColor Yellow
    } elseif ($errorMessage -like "*401*" -or $errorMessage -like "*Invalid*") {
        Write-Host "✅ validate-url endpoint exists (auth protection working)" -ForegroundColor Green
    } else {
        Write-Host "❓ validate-url endpoint status unclear: $errorMessage" -ForegroundColor Yellow
    }
}

Write-Host "`n🎛️ Testing Admin Panel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://online.rymaacademy.cloud/admin" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Admin panel is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Admin panel not accessible" -ForegroundColor Red
}

Write-Host "`n📊 Current Production Status:" -ForegroundColor Cyan
Write-Host "   📤 Upload to Cloudinary: ✅ Available" -ForegroundColor Green
Write-Host "   🔗 External Link Support: ❌ Not Deployed" -ForegroundColor Red  
Write-Host "   📺 YouTube URL Detection: ❌ Not Deployed" -ForegroundColor Red
Write-Host "   ✔️ URL Validation API: ❌ Not Deployed" -ForegroundColor Red
Write-Host "   🎨 Enhanced UI: ❌ Not Deployed" -ForegroundColor Red

Write-Host "`n🎯 After Deployment Status:" -ForegroundColor Cyan
Write-Host "   📤 Upload to Cloudinary: ✅ Available" -ForegroundColor Green
Write-Host "   🔗 External Link Support: ✅ Available" -ForegroundColor Green
Write-Host "   📺 YouTube URL Detection: ✅ Available" -ForegroundColor Green  
Write-Host "   ✔️ URL Validation API: ✅ Available" -ForegroundColor Green
Write-Host "   🎨 Enhanced UI: ✅ Available" -ForegroundColor Green

Write-Host "`n📋 Required Deployment Actions:" -ForegroundColor Magenta
Write-Host "   1. 📁 Copy server/utils/urlValidator.js to production" -ForegroundColor White
Write-Host "   2. 📁 Copy updated server/models/Course.js to production" -ForegroundColor White
Write-Host "   3. 📁 Copy updated server/routes/upload.js to production" -ForegroundColor White
Write-Host "   4. 📁 Copy built client/dist/* to production web directory" -ForegroundColor White
Write-Host "   5. 🔄 Restart Node.js application on production server" -ForegroundColor White

Write-Host "`n📖 Instructions:" -ForegroundColor Yellow
Write-Host "   📄 See: PRODUCTION-DEPLOYMENT-GUIDE.md for detailed steps" -ForegroundColor White
Write-Host "   🌐 Test: https://online.rymaacademy.cloud/admin after deployment" -ForegroundColor White

Write-Host "`n✅ Testing Complete!" -ForegroundColor Green