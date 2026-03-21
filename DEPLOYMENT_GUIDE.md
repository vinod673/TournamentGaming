# 🚀 ArenaX Gaming - Vercel Serverless Deployment Guide

## 📋 Overview

This guide will help you deploy both frontend and backend to Vercel as serverless functions.

---

## ⚠️ IMPORTANT: Before You Start

### 1. Security Warning
Your `.env` files contain **REAL production credentials**. Before deploying:

- ✅ **IMMEDIATELY rotate** these keys in Supabase dashboard
- ✅ **NEVER commit** `.env` files to Git (already in `.gitignore`)
- ✅ Use Vercel Environment Variables for secrets

### 2. What You'll Need
- Vercel account (free tier works)
- Supabase project credentials
- Cashfree payment gateway credentials
- Node.js installed (v18+)

---

## 🎯 Step-by-Step Deployment

### **Phase 1: Prepare Backend for Vercel**

#### 1.1 Update Backend Configuration

The backend is already configured for Vercel serverless:
- ✅ `vercel.json` exists with correct settings
- ✅ Express.js setup compatible with serverless
- ✅ CORS configured properly

#### 1.2 Test Backend Locally (Optional but Recommended)

```powershell
cd backend
npm install
npm run dev
```

Visit: `http://localhost:5000/api/health`

Expected response:
```json
{
  "name": "ArenaX Gaming API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

### **Phase 2: Deploy Backend to Vercel**

#### Option A: Deploy via Vercel CLI (Recommended)

```powershell
# Navigate to backend folder
cd backend

# Login to Vercel (first time only)
vercel login

# Deploy to preview/staging
vercel

# Review settings and confirm
# When prompted, set:
# - Set up and deploy: Yes
# - Which scope: Choose your account
# - Link to existing project: No
# - Project name: arenax-gaming-backend
# - Directory: ./backend
# - Override settings: No

# Deploy to production
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository OR use local push:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
4. Select the repository
5. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `./backend`
   - **Build Command:** `npm install`
   - **Output Directory:** (leave blank)
6. Click "Deploy"

---

### **Phase 3: Configure Backend Environment Variables**

After backend deployment:

#### Via Vercel Dashboard:

1. Go to your backend project on Vercel
2. Settings → Environment Variables
3. Add these variables:

```
SUPABASE_URL=https://pqmyslyhkxbkrbuladhq.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here
CASHFREE_ENV=PRODUCTION
CASHFREE_API_URL=https://api.cashfree.com/pg
CASHFREE_API_VERSION=2025-01-01

FRONTEND_URL=https://your-app.vercel.app  # Will update after frontend deploy
PORT=5000
NODE_ENV=production
```

#### Via CLI:

```powershell
cd backend
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
# ... repeat for all variables
```

---

### **Phase 4: Deploy Frontend to Vercel**

```powershell
# Navigate to frontend folder
cd frontend

# Login to Vercel (if not already)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Configure Frontend:**
- **Framework Preset:** Next.js
- **Root Directory:** `./frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

---

### **Phase 5: Configure Frontend Environment Variables**

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://pqmyslyhkxbkrbuladhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

NEXT_PUBLIC_CASHFREE_APP_ID=<your_cashfree_app_id>

NEXT_PUBLIC_BACKEND_URL=https://arenax-gaming-backend.vercel.app
NEXT_PUBLIC_SITE_URL=https://arenax-gaming.vercel.app
```

**Important:** Replace URLs with your actual deployed URLs!

---

### **Phase 6: Update Backend Frontend URL**

Go back to backend project on Vercel:
- Settings → Environment Variables
- Update `FRONTEND_URL` to your frontend's production URL
- Redeploy backend: `vercel --prod` (in backend folder)

---

### **Phase 7: Configure Cashfree Webhooks**

1. Login to Cashfree Dashboard
2. Go to Settings → Webhooks
3. Set webhook URL:
   ```
   https://arenax-gaming-backend.vercel.app/api/payment/webhook
   ```
4. Set return URL:
   ```
   https://arenax-gaming.vercel.app/wallet
   ```

---

## ✅ Testing Checklist

After deployment, test these endpoints:

### Backend Health Check
```
GET https://arenax-gaming-backend.vercel.app/api/health
```

### Get All Tournaments
```
GET https://arenax-gaming-backend.vercel.app/api/tournaments
```

### Frontend
```
https://arenax-gaming.vercel.app
```

### Payment Flow
1. Sign up / Login
2. Go to Wallet
3. Add Money (test with small amount)
4. Verify payment completion
5. Check wallet balance updated

---

## 🔧 Troubleshooting

### Issue: "Function timeout"
**Solution:** Vercel serverless functions have 10s timeout (Hobby plan)
- Upgrade to Pro plan for longer timeouts
- Optimize database queries
- Add caching

### Issue: "CORS errors"
**Solution:** Update CORS in `backend/server.js`:
```javascript
origin: 'https://arenax-gaming.vercel.app'
```

### Issue: "Environment variables not found"
**Solution:** 
- Redeploy after adding environment variables
- Check variable names match exactly
- Restart development server

### Issue: "Payment webhook not working"
**Solution:**
- Ensure webhook URL is HTTPS
- Check Cashfree dashboard configuration
- Test webhook locally first with ngrok (temporarily)

---

## 📊 Vercel Project Structure

```
Vercel Account
├── arenax-gaming (Frontend)
│   ├── Root: ./frontend
│   ├── Framework: Next.js
│   └── URL: https://arenax-gaming.vercel.app
│
└── arenax-gaming-backend (Backend API)
    ├── Root: ./backend
    ├── Framework: Node.js
    └── URL: https://arenax-gaming-backend.vercel.app
```

---

## 💡 Best Practices

### 1. Environment Variables
- Use different keys for development/production
- Rotate keys regularly
- Never commit `.env` files

### 2. Database Queries
- Use connection pooling (Supabase handles this)
- Add indexes for frequently queried columns
- Implement query caching where possible

### 3. API Optimization
- Keep serverless functions under 50MB
- Use streaming for large responses
- Implement rate limiting

### 4. Monitoring
- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Monitor function execution times

---

## 🎉 Post-Deployment Tasks

1. ✅ Test all user flows end-to-end
2. ✅ Verify payment webhooks are working
3. ✅ Test admin dashboard access
4. ✅ Check mobile responsiveness
5. ✅ Set up custom domain (optional)
6. ✅ Configure SSL certificate (automatic on Vercel)
7. ✅ Update DNS records (if using custom domain)

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Docs:** https://supabase.com/docs
- **Cashfree Integration:** Check Cashfree developer docs

---

## 🚨 Common Mistakes to Avoid

❌ Committing `.env` files to Git  
❌ Using localhost URLs in production  
❌ Not setting all environment variables  
❌ Forgetting to redeploy after env changes  
❌ Skipping webhook testing  
❌ Not checking function timeout limits  

✅ **Follow this guide step-by-step for successful deployment!**

---

**Last Updated:** March 21, 2026
