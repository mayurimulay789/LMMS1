#!/bin/bash

echo "🚀 Starting Ryma Academy Deployment..."

# Load environment variables
source .env.production

# Update system and install dependencies if needed
echo "📦 Checking system dependencies..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Installing Node.js and npm..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies and build client
echo "🏗️ Building client..."
cd client
npm install
npm run build
cd ..

# Install server dependencies
echo "🔧 Setting up server..."
cd server
npm install --production
cd ..

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/rymaacademy/client/dist
sudo mkdir -p /var/www/rymaacademy/uploads
sudo mkdir -p /var/backups/rymaacademy

# Copy built files
echo "📋 Copying files..."
sudo cp -r client/dist/* /var/www/rymaacademy/client/dist/
sudo cp server/.env.production /var/www/rymaacademy/server/.env

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data /var/www/rymaacademy
sudo chmod -R 755 /var/www/rymaacademy

# Setup PM2 process
echo "🔄 Configuring PM2..."
pm2 delete ryma-academy 2>/dev/null || true

# Ensure environment is set before starting
export NODE_ENV=production
export $(cat server/.env.production | xargs)

pm2 start server/src/index.js --name ryma-academy --env production
pm2 set ryma-academy env production
pm2 restart ryma-academy --update-env

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup

# Verify deployment
echo "🔍 Verifying deployment..."
sleep 5 # Wait for server to start
if curl -f https://online.rymaacademy.cloud/api/health; then
    echo "✅ Server health check passed"
else
    echo "❌ Server health check failed"
    exit 1
fi

# Configure and restart Nginx
echo "🌐 Configuring Nginx..."
sudo ln -sf /etc/nginx/sites-available/rymaacademy.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL if not exists
if [ ! -f "/etc/letsencrypt/live/online.rymaacademy.cloud/fullchain.pem" ]; then
    echo "🔐 Setting up SSL..."
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d online.rymaacademy.cloud --non-interactive --agree-tos -m admin@rymaacademy.cloud
fi

# Setup daily backups
echo "💾 Setting up backups..."
if ! crontab -l | grep -q "backup_rymaacademy"; then
    (crontab -l 2>/dev/null; echo "0 0 * * * /var/www/rymaacademy/backup_rymaacademy.sh") | crontab -
fi

echo "✅ Deployment completed successfully!"
echo "🌍 Your application is now running at https://online.rymaacademy.cloud"
echo "📊 Monitor the application using: pm2 monit"

