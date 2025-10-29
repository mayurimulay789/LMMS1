# Environment Configuration Guide

## Overview
This project supports multiple environments with proper configuration management to ensure smooth operation in both local development and production environments.

## Environment Files Structure

### Client (Frontend)
- `.env.local` - Local development environment
- `.env` - Production environment (already configured)
- `.env.production` - Production build environment
- `.env.example` - Template for environment variables

### Server (Backend)
- `.env.local` - Local development environment
- `.env` - Production environment (to be created)
- `.env.example` - Template for environment variables

## Quick Setup for Local Development

### 1. Client Setup
```bash
cd client
cp .env.example .env.local
# Edit .env.local with your local development settings
npm run dev:local
```

### 2. Server Setup
```bash
cd server
cp .env.example .env.local
# Edit .env.local with your local development settings
npm run dev:local
```

## Environment Variables

### Client Environment Variables
| Variable | Description | Local Value | Production Value |
|----------|-------------|-------------|------------------|
| `VITE_API_URL` | Backend API URL | `http://localhost:2000/api` | Your production API URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID | Test key | Live key |
| `VITE_APP_NAME` | Application name | LMMS Learning Management System | Your app name |

### Server Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment mode | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT encryption secret | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | Yes |

## API Configuration

The application now uses a centralized API configuration system:

### Features:
- ✅ Automatic environment detection
- ✅ Fallback URL handling  
- ✅ Development vs Production modes
- ✅ Error handling and logging
- ✅ No hardcoded URLs

### Usage in Components:
```javascript
import { apiRequest } from "../config/api"

// Use apiRequest instead of fetch with hardcoded URLs
const response = await apiRequest("courses")
const data = await response.json()
```

## Checking Environment Setup

Run the environment check script to verify your configuration:

```bash
# From project root
npm run check-env

# Or from client directory
cd client && npm run check-env

# Or from server directory  
cd server && npm run check-env
```

## Development vs Production

### Development Mode
- Uses `.env.local` files
- Enables detailed logging
- Uses test payment keys
- Connects to local MongoDB
- CORS allows localhost origins

### Production Mode
- Uses `.env` or `.env.production` files
- Minimal logging
- Uses live payment keys
- Connects to production MongoDB
- CORS restricted to production domain

## Common Issues & Solutions

### Issue: "CORS Error" in production
**Solution:** Make sure `CLIENT_URL` or `FRONTEND_URL` is set in server environment

### Issue: "API endpoint not found"
**Solution:** Check that `VITE_API_URL` is properly configured in client environment

### Issue: Hardcoded localhost URLs
**Solution:** Use the `apiRequest` function from `config/api.js` instead of hardcoded fetch calls

## Security Best Practices

1. ✅ Never commit `.env` files to version control
2. ✅ Use different secrets for development and production
3. ✅ Use test payment keys in development
4. ✅ Restrict CORS origins in production
5. ✅ Use strong JWT secrets (32+ characters)
6. ✅ Use HTTPS in production

## Deployment Checklist

### Client Deployment
- [ ] Set production environment variables in `.env.production`
- [ ] Run `npm run build:production`
- [ ] Deploy `dist` folder to hosting service
- [ ] Verify API URLs point to production backend

### Server Deployment
- [ ] Set production environment variables in `.env`
- [ ] Verify MongoDB connection
- [ ] Update CORS origins
- [ ] Use production payment keys
- [ ] Enable security middleware
- [ ] Run `npm start`

## Testing Environment Configuration

Run this command to test if your environment is properly configured:

```bash
# Test client configuration
cd client && npm run check-env

# Test server configuration  
cd server && npm run check-env
```

This will show you which environment variables are set and which ones need attention.