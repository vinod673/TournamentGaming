# ArenaX Gaming - Quick Deploy Script for Vercel (PowerShell)
# This script helps you deploy to Vercel quickly

Write-Host "🎮 ArenaX Gaming - Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel
Write-Host "📝 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

# Navigate to frontend directory
Write-Host "📁 Setting up frontend deployment..." -ForegroundColor Cyan
Set-Location -Path ".\frontend"

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item "..\.env.example" ".env.local"
    Write-Host "⚠️  Please update .env.local with your actual values before deploying." -ForegroundColor Red
    exit 1
}

# Deploy to preview
Write-Host "🚀 Deploying to Vercel (preview)..." -ForegroundColor Cyan
$continue = Read-Host "Continue with preview deployment? (y/n)"
if ($continue -eq "y" -or $continue -eq "Y") {
    vercel
}

# Optional: Deploy to production
Write-Host ""
$deployProd = Read-Host "Deploy to production? (y/n)"
if ($deployProd -eq "y" -or $deployProd -eq "Y") {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
    vercel --prod
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📊 Check your Vercel dashboard for deployment status." -ForegroundColor Cyan
