# Production Deployment Commands

## 🚀 Production Mode Commands

### Prerequisites
1. Ensure you have production environment variables configured
2. Make sure MongoDB and other services are accessible
3. Have your domain/server ready

---

## 📱 CLIENT (Frontend) Production Commands

### 1. Build for Production
```bash
cd client
npm run build:production
```

### 2. Preview Production Build Locally
```bash
cd client
npm run preview
```

### 3. Deploy to Static Hosting (Vercel/Netlify/etc.)
```bash
# Build first
cd client
npm run build:production

# Deploy the 'dist' folder to your hosting service
# The 'dist' folder contains all production-ready files
```

---

## 🖥️ SERVER (Backend) Production Commands

### 1. Install Production Dependencies Only
```bash
cd server
npm ci --only=production
```

### 2. Start Server in Production Mode
```bash
cd server
npm start
```

### 3. Start Server with PM2 (Recommended for VPS/Server)
```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
cd server
pm2 start src/index.js --name "lmms-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to restart on system reboot
pm2 startup
```

---

## 🔧 Full Stack Production Commands

### Option 1: Run Both Services Separately
```bash
# Terminal 1 - Start Server
cd server
npm start

# Terminal 2 - Build and Serve Client
cd client
npm run build:production
npm run preview
```

### Option 2: Use Production Script (if available)
```bash
# From project root
npm run start
```

---

## 🌐 Environment Configuration for Production

### 1. Server Environment (.env in server folder)
```bash
# Create production .env file
cd server
cp .env.example .env

# Edit with production values:
NODE_ENV=production
PORT=2000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lmms-production
JWT_SECRET=your-super-strong-production-secret-32chars
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 2. Client Environment (already configured in .env.production)
The client already has `.env.production` configured with:
```bash
VITE_API_URL=https://online.rymaacademy.cloud/api
VITE_BACKEND_URL=https://online.rymaacademy.cloud/api
```

---

## 📦 Docker Production Commands (Optional)

### 1. Build Docker Images
```bash
# Build client
docker build -t lmms-client ./client

# Build server  
docker build -t lmms-server ./server
```

### 2. Run with Docker Compose
```bash
docker-compose up -d
```

---

## 🔍 Health Check Commands

### 1. Check Server Health
```bash
curl https://yourdomain.com/api/health
```

### 2. Check API Endpoints
```bash
curl https://yourdomain.com/api/courses
```

### 3. Monitor Server Logs (if using PM2)
```bash
pm2 logs lmms-server
pm2 monit
```

---

## ⚡ Quick Production Deployment

### For VPS/Dedicated Server:
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm run install:all

# 3. Build client
cd client && npm run build:production && cd ..

# 4. Start/restart server with PM2
cd server
pm2 restart lmms-server || pm2 start src/index.js --name "lmms-server"

# 5. Serve client with nginx or use PM2 for static serving
```

### For Serverless/JAMstack (Vercel + MongoDB Atlas):
```bash
# 1. Deploy client to Vercel
cd client
vercel --prod

# 2. Deploy server to Vercel/Railway/Heroku
cd server
# Follow your serverless platform's deployment process
```

---

## 🛡️ Security Checklist for Production

- [ ] Environment variables are set correctly
- [ ] Database connection uses production credentials
- [ ] CORS is configured for production domain only
- [ ] HTTPS is enabled
- [ ] Rate limiting is active
- [ ] Security headers are configured
- [ ] File uploads use cloud storage (not local)
- [ ] Logs are configured for production
- [ ] Error monitoring is setup

---

## 🔧 Troubleshooting Production Issues

### Check Environment Variables:
```bash
cd client && node ../check-env.js
cd server && node ../check-env.js
```

### View Server Logs:
```bash
# If using PM2
pm2 logs lmms-server

# If running directly
cd server && npm start
```

### Test API Connectivity:
```bash
curl -i https://yourdomain.com/api/health
curl -i https://yourdomain.com/api/courses
```

---

## 📋 Production URLs

Based on your current configuration:
- **API Base URL**: `https://online.rymaacademy.cloud/api`
- **Client URL**: Your frontend domain
- **Health Check**: `https://online.rymaacademy.cloud/api/health`