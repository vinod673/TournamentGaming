# 🚀 Quick Start: Deploy to Vercel Serverless

## ⚡ Fast Track Deployment (5 Minutes)

### Prerequisites
- Node.js installed (v18+)
- Vercel account (free)
- Supabase project set up

---

## Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

---

## Step 2: Run Deployment Script

```powershell
.\deploy-vercel-serverless.ps1
```

This automated script will:
1. ✅ Check Vercel CLI installation
2. ✅ Login to Vercel
3. ✅ Deploy backend API
4. ✅ Deploy frontend app
5. ✅ Guide you through environment setup

---

## Step 3: Add Environment Variables

### Backend (Vercel Dashboard → Backend Project → Settings → Environment Variables):

```
SUPABASE_URL=https://pqmyslyhkxbkrbuladhq.supabase.co
SUPABASE_ANON_KEY=<your_key_from_frontend_.env.local>
SUPABASE_SERVICE_KEY=<your_service_key_from_backend_.env>

CASHFREE_APP_ID=123471541a4847375e09359a1275174321
CASHFREE_SECRET_KEY=<your_secret_from_backend_.env>
CASHFREE_ENV=PRODUCTION

FRONTEND_URL=https://YOUR-FRONTEND-URL.vercel.app
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel Dashboard → Frontend Project → Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://pqmyslyhkxbkrbuladhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key_from_frontend_.env.local>
NEXT_PUBLIC_CASHFREE_APP_ID=123471541a4847375e09359a1275174321
NEXT_PUBLIC_BACKEND_URL=https://YOUR-BACKEND-URL.vercel.app
```

---

## Step 4: Redeploy

After adding environment variables, redeploy both projects:

```powershell
# Redeploy backend
cd backend
vercel --prod

# Redeploy frontend
cd ..\frontend
vercel --prod
```

---

## Step 5: Configure Cashfree Webhooks

Login to Cashfree Dashboard and set:

**Webhook URL:**
```
https://YOUR-BACKEND-URL.vercel.app/api/payment/webhook
```

**Return URL:**
```
https://YOUR-FRONTEND-URL.vercel.app/wallet
```

---

## ✅ Test Your Deployment

1. Visit your frontend: `https://YOUR-FRONTEND-URL.vercel.app`
2. Test signup/login
3. Browse tournaments
4. Test wallet deposit (small amount)
5. Verify payment completion

---

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

### Backend:
```powershell
cd backend
vercel login
vercel deploy --prod
```

### Frontend:
```powershell
cd frontend
vercel login
vercel deploy --prod
```

---

## 📞 Need Help?

- **Detailed Guide:** See `DEPLOYMENT_GUIDE.md`
- **Vercel Docs:** https://vercel.com/docs
- **Troubleshooting:** Check the troubleshooting section in DEPLOYMENT_GUIDE.md

---

## 🎉 Success Indicators

✅ Both deployments show "Ready" status in Vercel dashboard  
✅ Health check returns 200: `https://YOUR-BACKEND-URL.vercel.app/api/health`  
✅ Frontend loads without errors  
✅ Authentication works  
✅ Payment flow completes successfully  

---

**Deployment Time:** ~5-10 minutes  
**Difficulty:** Easy  

Good luck! 🚀
