# Vercel Serverless Deployment Script for ArenaX Gaming
# This script deploys both frontend and backend to Vercel

Write-Host "🚀 ArenaX Gaming - Vercel Serverless Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    if (-not $vercelVersion) {
        throw "Vercel CLI not found"
    }
    Write-Host "✅ Vercel CLI detected: v$vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not installed. Installing now..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

# Login to Vercel
Write-Host ""
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Cyan
try {
    $whoami = vercel whoami 2>$null
    if ($whoami) {
        Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Please login to Vercel..." -ForegroundColor Yellow
        vercel login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Login failed" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "⚠️  Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STEP 1: Deploy Backend API" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location "backend"

Write-Host "📦 Deploying backend to Vercel..." -ForegroundColor Cyan
Write-Host "This will create/preview your backend project" -ForegroundColor Gray
Write-Host ""

# Deploy backend
vercel deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Backend deployment initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 IMPORTANT: Copy your backend URL from the output above" -ForegroundColor Yellow
    Write-Host "Example: https://arenax-gaming-backend.vercel.app" -ForegroundColor Gray
    Write-Host ""
    
    # Prompt user for backend URL
    $backendUrl = Read-Host "Enter your backend production URL (or press Enter to skip)"
    
    if ($backendUrl) {
        Write-Host ""
        Write-Host "💾 Saving backend URL to .env file..." -ForegroundColor Cyan
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace 'BACKEND_URL=.*', "BACKEND_URL=$backendUrl"
        Set-Content ".env" -Value $envContent
        Write-Host "✅ Backend URL saved" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "❌ Backend deployment failed. Please check errors above." -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STEP 2: Configure Environment Variables" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANT: You need to add these environment variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "For BACKEND project (arenax-gaming-backend):" -ForegroundColor White
Write-Host "  SUPABASE_URL=https://pqmyslyhkxbkrbuladhq.supabase.co" -ForegroundColor Gray
Write-Host "  SUPABASE_ANON_KEY=<your_anon_key>" -ForegroundColor Gray
Write-Host "  SUPABASE_SERVICE_KEY=<your_service_key>" -ForegroundColor Gray
Write-Host "  CASHFREE_APP_ID=123471541a4847375e09359a1275174321" -ForegroundColor Gray
Write-Host "  CASHFREE_SECRET_KEY=<your_secret_key>" -ForegroundColor Gray
Write-Host "  CASHFREE_ENV=PRODUCTION" -ForegroundColor Gray
Write-Host "  FRONTEND_URL=<your_frontend_url>" -ForegroundColor Gray
Write-Host ""
Write-Host "For FRONTEND project (arenax-gaming):" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_SUPABASE_URL=https://pqmyslyhkxbkrbuladhq.supabase.co" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_CASHFREE_APP_ID=123471541a4847375e09359a1275174321" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_BACKEND_URL=<your_backend_url>" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STEP 3: Deploy Frontend" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location "frontend"

Write-Host "🎨 Deploying frontend to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Deploy frontend
vercel deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Frontend deployment initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 IMPORTANT: Copy your frontend URL from the output above" -ForegroundColor Yellow
    Write-Host "Example: https://arenax-gaming.vercel.app" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Frontend deployment failed. Please check errors above." -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STEP 4: Update Environment Variables" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 You need to update the FRONTEND_URL in your backend project:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to Vercel Dashboard → arenax-gaming-backend → Settings → Environment Variables" -ForegroundColor White
Write-Host "2. Update FRONTEND_URL to your new frontend URL" -ForegroundColor White
Write-Host "3. Click 'Redeploy' to apply changes" -ForegroundColor White
Write-Host ""
Write-Host "📋 Full checklist:" -ForegroundColor Cyan
Write-Host "  ✅ Add all environment variables to both projects" -ForegroundColor Gray
Write-Host "  ✅ Update FRONTEND_URL in backend project" -ForegroundColor Gray
Write-Host "  ✅ Configure Cashfree webhooks with production URLs" -ForegroundColor Gray
Write-Host "  ✅ Test payment flow end-to-end" -ForegroundColor Gray
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your ArenaX Gaming platform is now live on Vercel!" -ForegroundColor Green
Write-Host ""
