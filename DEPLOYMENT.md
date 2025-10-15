# Production Deployment Guide

## Environment Setup

### 1. Server Environment Variables (.env)
```bash
# Server Configuration
PORT=2000
NODE_ENV=production

# Database (use your production MongoDB URL)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lmms-production

# JWT Configuration (use strong secrets)
JWT_SECRET=your-super-strong-jwt-secret-key-at-least-32-characters
JWT_EXPIRES_IN=7d

# Client URL for CORS (your production domain)
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your-production-razorpay-key-id
RAZORPAY_KEY_SECRET=your-production-razorpay-key-secret
```

### 2. Client Environment Variables (.env.production)
```bash
# Client Environment Variables for Production
VITE_API_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com/api

# App Configuration
VITE_APP_NAME=LMMS Learning Management System
VITE_APP_VERSION=1.0.0

# Payment Configuration
VITE_RAZORPAY_KEY_ID=your-production-razorpay-key-id
```

## Deployment Steps

### For Client (Frontend)
1. Create `.env.production` file with production variables
2. Build the client: `npm run build`
3. Deploy the `dist` folder to your hosting service

### For Server (Backend)
1. Create `.env` file with production variables
2. Install production dependencies: `npm ci --only=production`
3. Start the server: `npm start`

## Important Security Notes

1. Never commit `.env` files to version control
2. Use strong JWT secrets (at least 32 characters)
3. Use HTTPS in production
4. Set proper CORS origins
5. Use environment-specific database URLs
6. Enable rate limiting and security headers
7. Use cloud storage for file uploads instead of local storage

## CORS Configuration

The server is configured to accept requests from:
- Development: http://localhost:5173
- Production: The domain specified in CLIENT_URL or FRONTEND_URL environment variables

Make sure to set the correct production URL in your environment variables.