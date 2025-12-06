#!/bin/bash

# Stop on any error
set -e

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 Starting deployment..."

# Navigate to project root (adjust path if necessary)
cd /var/www/rff/f123dashboard || { log "❌ Failed to navigate to project directory"; exit 1; }

log "⬇️  Pulling latest changes..."
#git pull origin main
git pull origin server-migration

log "📦 Installing dependencies..."
NODE_ENV=development npm install

log "🏗️  Building project..."
npm run build

log "Installing dist dependencies..."
cd /var/www/rff/dist || { log "❌ Failed to navigate to dist directory"; exit 1; }
npm install

log "🔄 Restarting application..."
pm2 reload rff --update-env 

log "✅ Deployment complete!"
