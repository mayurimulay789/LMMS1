# 🚀 Production Deployment Checklist - Course Thumbnail Feature

## Files to Upload to Production Server:

### 1. Backend Files (Upload to your production server):

```bash
# NEW FILE - Upload this to server/utils/
📁 server/utils/urlValidator.js

# UPDATED FILE - Replace existing file  
📁 server/models/Course.js

# UPDATED FILE - Replace existing file
📁 server/routes/upload.js
```

### 2. Frontend Files (Upload to web directory):

```bash
# UPDATED BUILD - Replace entire dist folder
📁 client/dist/* → /var/www/rymaacademy/client/dist/
```

## Deployment Commands:

### On Production Server:

```bash
# 1. Navigate to your project directory
cd /path/to/your/production/project

# 2. Install any new dependencies
npm install

# 3. Restart your Node.js application
pm2 restart ryma-academy
# OR
systemctl restart your-nodejs-service

# 4. Verify the server is running
pm2 status
```

## After Deployment - Test Online:

### 1. Test API Endpoint:
```bash
curl -X POST https://online.rymaacademy.cloud/api/upload/validate-url \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"}'
```

### 2. Test Frontend Interface:
1. Go to: `https://online.rymaacademy.cloud/admin`
2. Navigate to: Course Management → Create Course  
3. Look for: Course Thumbnail section with two tabs
4. Test both modes:
   - Upload Image/Video (should work as before)
   - External Link (NEW - try a YouTube URL)

## Expected Results After Deployment:

✅ **NEW validate-url endpoint**: `POST /api/upload/validate-url`  
✅ **Enhanced UI**: Dual-mode thumbnail interface  
✅ **YouTube support**: Automatic thumbnail extraction from YouTube URLs  
✅ **Database ready**: thumbnailSource field for tracking source type  

---

## 🔧 Quick Deployment Method:

If you have SSH access to your production server:

```bash
# Upload files via SCP
scp server/utils/urlValidator.js user@server:/path/to/production/server/utils/
scp server/models/Course.js user@server:/path/to/production/server/models/  
scp server/routes/upload.js user@server:/path/to/production/server/routes/
scp -r client/dist/* user@server:/var/www/rymaacademy/client/dist/

# Then SSH and restart
ssh user@server
cd /path/to/production
npm install
pm2 restart ryma-academy
```

**After deployment, we can test the online functionality! 🌐**