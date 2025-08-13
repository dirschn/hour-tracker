#!/bin/bash

# Frontend deployment script for hours.dirschn.com
# Usage: ./scripts/deploy-frontend.sh [server-user@server-ip]

set -e

# Configuration
LOCAL_BUILD_DIR="/home/nick/Projects/hour-tracker/frontend/dist/frontend/browser"
REMOTE_REPO_PATH="/srv/hour-tracker"
REMOTE_BUILD_PATH="/srv/hour-tracker/frontend/dist/frontend/browser"
DEFAULT_SERVER="rails@hours.dirschn.com"  # Change this to your actual server

# Use provided server or default
SERVER=${1:-$DEFAULT_SERVER}

echo "🏗️  Building Angular frontend for production..."
cd /home/nick/Projects/hour-tracker/frontend
npm run build:prod

echo "📦 Build completed. Files are in: $LOCAL_BUILD_DIR"

echo "🚀 Deploying to $SERVER:$REMOTE_REPO_PATH"

# Update repository on server
echo "📥 Updating repository on server..."
ssh $SERVER "cd $REMOTE_REPO_PATH && git restore . && git pull origin main"

# Copy built files to server repository
echo "📁 Copying built files to server repository..."
scp -r $LOCAL_BUILD_DIR/* $SERVER:$REMOTE_BUILD_PATH/

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://hours.dirschn.com"
