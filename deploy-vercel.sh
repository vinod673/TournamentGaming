#!/bin/bash

# ArenaX Gaming - Quick Deploy Script for Vercel
# This script helps you deploy to Vercel quickly

echo "🎮 ArenaX Gaming - Vercel Deployment Script"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "📝 Logging in to Vercel..."
vercel login

# Navigate to frontend directory
echo "📁 Setting up frontend deployment..."
cd frontend

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from .env.example..."
    cp ../.env.example .env.local
    echo "⚠️  Please update .env.local with your actual values before deploying."
    exit 1
fi

# Deploy to preview
echo "🚀 Deploying to Vercel (preview)..."
read -p "Continue with preview deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel
fi

# Optional: Deploy to production
echo ""
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to production..."
    vercel --prod
fi

echo ""
echo "✅ Deployment complete!"
echo "📊 Check your Vercel dashboard for deployment status."
