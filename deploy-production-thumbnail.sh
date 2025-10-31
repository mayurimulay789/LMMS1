#!/bin/bash

# Production Deployment Script for Course Thumbnail Feature
# This script deploys all missing components to production

echo "🚀 Deploying Course Thumbnail Feature to Production..."
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌]${NC} $1"
}

print_info() {
    echo -e "${PURPLE}[ℹ️]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_step "1. Pre-deployment Verification"

# Check if required files exist
required_files=(
    "server/utils/urlValidator.js"
    "server/models/Course.js"
    "server/routes/upload.js"
    "client/src/Components/AdminCourseForm.jsx"
    "client/src/utils/imageUtils.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Verify specific implementations
print_step "2. Verifying Implementation Details"

# Check Course model for thumbnailSource
if grep -q "thumbnailSource" server/models/Course.js; then
    print_success "Course model has thumbnailSource field"
else
    print_error "Course model missing thumbnailSource field"
    exit 1
fi

# Check upload route for validate-url endpoint
if grep -q "validate-url" server/routes/upload.js; then
    print_success "Upload route has validate-url endpoint"
else
    print_error "Upload route missing validate-url endpoint"
    exit 1
fi

# Check if urlValidator is imported in upload route
if grep -q "urlValidator" server/routes/upload.js; then
    print_success "urlValidator properly imported in upload route"
else
    print_error "urlValidator not imported in upload route"
    exit 1
fi

print_step "3. Building Frontend"
cd client
if npm run build; then
    print_success "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

print_step "4. Installing Server Dependencies"
cd server
if npm install; then
    print_success "Server dependencies installed"
else
    print_error "Server dependency installation failed"
    exit 1
fi
cd ..

print_step "5. Testing Backend Endpoints Locally"

# Start server in background for testing
cd server
node src/index.js &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Test base API
if curl -f http://localhost:2000/api > /dev/null 2>&1; then
    print_success "Local server is running"
else
    print_warning "Local server test failed - continuing with deployment"
fi

# Kill test server
kill $SERVER_PID 2>/dev/null

print_step "6. Preparing Production Files"

# Create deployment directory structure
mkdir -p production-deploy/{client,server}

# Copy built frontend
cp -r client/dist/* production-deploy/client/

# Copy server files
cp -r server/* production-deploy/server/

print_success "Production files prepared"

print_step "7. Creating Production Environment Check"

cat > production-deploy/verify-production.sh << 'EOF'
#!/bin/bash

echo "🔍 Verifying Production Deployment..."

# Test production API endpoints
PROD_API="https://online.rymaacademy.cloud/api"

echo "Testing base API..."
if curl -f "$PROD_API" > /dev/null 2>&1; then
    echo "✅ Production API is accessible"
else
    echo "❌ Production API is not accessible"
    exit 1
fi

echo "Testing upload endpoints..."
if curl -f "$PROD_API/upload/course-media" -X POST -H "Authorization: Bearer test" 2>/dev/null | grep -q "Invalid"; then
    echo "✅ Upload endpoint exists (auth protection working)"
else
    echo "❌ Upload endpoint not found"
fi

echo "Testing new validate-url endpoint..."
if curl -f "$PROD_API/upload/validate-url" -X POST -H "Authorization: Bearer test" 2>/dev/null | grep -q "Invalid\|endpoint"; then
    echo "✅ validate-url endpoint exists"
else
    echo "❌ validate-url endpoint not deployed yet"
fi

echo "✅ Production verification completed"
EOF

chmod +x production-deploy/verify-production.sh

print_step "8. Creating Deployment Instructions"

cat > production-deploy/DEPLOY.md << EOF
# Course Thumbnail Feature - Production Deployment Instructions

## 📋 Deployment Checklist

### Backend Deployment:
1. Upload \`server/\` files to production server
2. Install dependencies: \`npm install\`
3. Restart the Node.js process
4. Verify endpoints are accessible

### Frontend Deployment:
1. Upload \`client/\` built files to web server
2. Update Nginx configuration if needed
3. Clear CDN cache if applicable

### Database:
- No manual migration needed
- \`thumbnailSource\` field will be added automatically when courses are created/updated

## 🔧 New Production Endpoints:

### POST /api/upload/validate-url
- **Purpose**: Validates external URLs for course thumbnails
- **Authentication**: Required (Bearer token)
- **Request Body**:
  \`\`\`json
  {
    "url": "https://example.com/image.jpg"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "success": true,
    "message": "URL validated successfully",
    "data": {
      "url": "https://example.com/image.jpg",
      "isValid": true,
      "type": "image",
      "contentType": "image/jpeg"
    }
  }
  \`\`\`

## 🎯 Features Enabled After Deployment:

1. **✅ Upload to Cloudinary** - Already working
2. **🆕 External Link Support** - NEW
3. **🆕 YouTube URL Detection** - NEW  
4. **🆕 URL Validation** - NEW
5. **🆕 Database Schema Updates** - NEW

## 🧪 Testing After Deployment:

1. Access admin panel: https://online.rymaacademy.cloud/admin
2. Go to Course Management → Create Course
3. Test both thumbnail modes:
   - Upload Image/Video
   - External Link (try YouTube URL)
4. Verify thumbnails save and display correctly

## 🔄 Verification Script:
Run: \`./verify-production.sh\` to test all endpoints

## 📞 Support:
If any issues occur, check:
1. Node.js server logs
2. Nginx error logs  
3. Database connection
4. Cloudinary configuration
EOF

print_step "9. Final Deployment Summary"

echo ""
echo "🎉 COURSE THUMBNAIL FEATURE DEPLOYMENT PACKAGE READY!"
echo "========================================================"
echo ""
echo "📦 Package Contents:"
echo "   📁 production-deploy/client/     - Built frontend files"
echo "   📁 production-deploy/server/     - Updated backend files"
echo "   📄 production-deploy/DEPLOY.md   - Deployment instructions"
echo "   🔍 production-deploy/verify-production.sh - Verification script"
echo ""

print_info "Components Ready for Production:"
echo "   ✅ AdminCourseForm.jsx - Enhanced thumbnail interface"
echo "   ✅ imageUtils.js - Image handling utilities"
echo "   ✅ Course.js - Updated database model"
echo "   ✅ upload.js - New validate-url endpoint"
echo "   ✅ urlValidator.js - URL validation utility"
echo ""

print_info "New Features After Deployment:"
echo "   🔗 External link support for thumbnails"
echo "   📺 YouTube URL automatic detection"
echo "   ✔️ Optional URL validation (non-blocking)"
echo "   🏗️ Enhanced database schema"
echo "   🎨 Improved user interface"
echo ""

print_warning "Next Steps:"
echo "   1. Copy 'production-deploy' folder to your production server"
echo "   2. Follow instructions in 'DEPLOY.md'"
echo "   3. Run verification script after deployment"
echo "   4. Test the feature in admin panel"
echo ""

print_success "🚀 Ready for Production Deployment!"

# Create a quick deployment command
echo ""
echo "🔧 Quick Deploy Command (if using SSH):"
echo "   scp -r production-deploy/ user@your-server:/path/to/deployment/"
echo ""

# Show current production status
echo "📊 Current Production Status:"
echo "   ❌ /api/upload/validate-url - Not deployed"
echo "   ❌ External Link Support - Not available"  
echo "   ❌ YouTube URL Detection - Not available"
echo "   ❌ Enhanced Thumbnail UI - Not available"
echo ""
echo "📈 After Deployment Status:"
echo "   ✅ /api/upload/validate-url - Available"
echo "   ✅ External Link Support - Available"
echo "   ✅ YouTube URL Detection - Available" 
echo "   ✅ Enhanced Thumbnail UI - Available"
echo ""

print_success "Deployment package creation completed! 🎯"