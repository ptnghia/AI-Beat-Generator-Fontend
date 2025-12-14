#!/bin/bash

# Frontend Deployment Script for AI Beat Generator
# Production Domain: https://optiwellai.com/

set -e  # Exit on error

echo "🚀 Starting frontend deployment to https://optiwellai.com/"
echo "================================================"

# Navigate to frontend directory
cd "$(dirname "$0")"
FRONTEND_DIR=$(pwd)
PROJECT_ROOT=$(dirname "$FRONTEND_DIR")

echo "📁 Frontend directory: $FRONTEND_DIR"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if we're in a git repository
if [ -d .git ] || [ -d ../.git ]; then
    echo "📥 Pulling latest changes from git..."
    git pull origin main || echo "⚠️  Git pull failed or no changes"
    echo ""
fi

# Install/update dependencies if package.json changed
if [ -f package.json ]; then
    echo "📦 Checking dependencies..."
    if [ package.json -nt node_modules ]; then
        echo "Installing npm dependencies..."
        npm install
    else
        echo "✓ Dependencies up to date"
    fi
    echo ""
fi

# Build production
echo "🔨 Building production frontend..."
echo "Environment: production"
echo "API URL: https://optiwellai.com/api"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Deployment aborted."
    exit 1
fi
echo ""

# Navigate to project root for PM2 commands
cd "$PROJECT_ROOT"

# Reload PM2
echo "🔄 Reloading frontend with PM2..."
pm2 reload ecosystem.config.js --only ai-beat-generator-frontend

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 reload failed, trying restart..."
    pm2 restart ai-beat-generator-frontend
fi
echo ""

# Wait for startup
echo "⏳ Waiting for frontend to start..."
sleep 3

# Show status
echo "📊 PM2 Status:"
pm2 list | grep ai-beat-generator

echo ""
echo "✅ Frontend deployment complete!"
echo "================================================"
echo "🌐 Production URL: https://optiwellai.com/"
echo "🔧 Local URL: http://localhost:4001"
echo ""
echo "📋 Useful commands:"
echo "  pm2 logs ai-beat-generator-frontend    # View logs"
echo "  pm2 restart ai-beat-generator-frontend # Restart"
echo "  pm2 monit                               # Monitor all processes"
echo ""
echo "📊 Check logs for errors:"
echo "  tail -f $PROJECT_ROOT/logs/frontend-out.log"
echo "  tail -f $PROJECT_ROOT/logs/frontend-error.log"
