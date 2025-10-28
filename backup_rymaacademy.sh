#!/bin/bash

# Load environment variables
source /var/www/rymaacademy/server/.env

# Set backup directory
BACKUP_DIR="/var/backups/rymaacademy"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "📑 Backing up MongoDB database..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# Backup uploads
echo "🗂️ Backing up uploads..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/rymaacademy/uploads

# Backup environment files
echo "⚙️ Backing up configuration..."
cp /var/www/rymaacademy/server/.env "$BACKUP_DIR/env_$DATE.backup"

# Remove backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -exec rm {} \;
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "✅ Backup completed successfully!"