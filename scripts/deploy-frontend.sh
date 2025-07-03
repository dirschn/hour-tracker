#!/bin/bash

# Frontend deployment script for hours.dirschn.com
# Usage: ./scripts/deploy-frontend.sh [server-user@server-ip]

set -e

# Configuration
LOCAL_BUILD_DIR="/home/nick/Projects/hour-tracker/frontend/dist/frontend/browser"
REMOTE_PATH="/var/www/hours.dirschn.com"
DEFAULT_SERVER="root@your-server-ip"  # Change this to your actual server

# Use provided server or default
SERVER=${1:-$DEFAULT_SERVER}

echo "🏗️  Building Angular frontend for production..."
cd /home/nick/Projects/hour-tracker/frontend
npm run build:prod

echo "📦 Build completed. Files are in: $LOCAL_BUILD_DIR"

echo "🚀 Deploying to $SERVER:$REMOTE_PATH"

# Create backup of current deployment (optional)
echo "📋 Creating backup of current deployment..."
ssh $SERVER "if [ -d $REMOTE_PATH ]; then cp -r $REMOTE_PATH ${REMOTE_PATH}.backup.$(date +%Y%m%d_%H%M%S); fi"

# Create directory if it doesn't exist
ssh $SERVER "mkdir -p $REMOTE_PATH"

# Copy files
echo "📁 Copying files..."
scp -r $LOCAL_BUILD_DIR/* $SERVER:$REMOTE_PATH/

# Set proper permissions
echo "🔐 Setting permissions..."
ssh $SERVER "chown -R www-data:www-data $REMOTE_PATH && chmod -R 755 $REMOTE_PATH"

# Test nginx configuration and reload
echo "🔄 Reloading Nginx..."
ssh $SERVER "nginx -t && systemctl reload nginx"

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://hours.dirschn.com"