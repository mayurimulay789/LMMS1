#!/bin/bash

# Course Thumbnail Feature - Production Deployment Script
# Run this on your production server

echo "🚀 Deploying Course Thumbnail Feature to Production..."

# Step 1: Backup current files
echo "📦 Creating backup..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp server/models/Course.js backup/$(date +%Y%m%d_%H%M%S)/Course.js.bak 2>/dev/null || true
cp server/routes/upload.js backup/$(date +%Y%m%d_%H%M%S)/upload.js.bak 2>/dev/null || true


# Step 2: Deploy backend files
echo "📁 Deploying backend files..."

# Copy the new URL validator utility
echo "  - Adding urlValidator.js..."
# Upload: server/utils/urlValidator.js

# Update Course model with thumbnailSource field  
echo "  - Updating Course.js model..."
# Upload: server/models/Course.js

# Update upload route with validate-url endpoint
echo "  - Updating upload.js route..."
# Upload: server/routes/upload.js

# Step 3: Install dependencies (if any new ones)
echo "📦 Installing dependencies..."
npm install

# Step 4: Restart application
echo "🔄 Restarting application..."
pm2 restart ryma-academy || systemctl restart your-nodejs-service

# Step 5: Deploy frontend
echo "🌐 Deploying frontend..."
# Copy client/dist/* to web directory
# Upload: client/dist/* to /var/www/rymaacademy/client/dist/

echo "✅ Deployment completed!"
echo ""
echo "🧪 Next steps:"
echo "1. Test API: https://online.rymaacademy.cloud/api/upload/validate-url"
echo "2. Test UI: https://online.rymaacademy.cloud/admin"
echo "3. Create a test course with external thumbnail link"
echo ""