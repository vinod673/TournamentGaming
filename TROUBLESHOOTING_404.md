# 🔧 Troubleshooting Vercel 404 Errors

## ❌ Common Causes of 404 on Vercel

### Issue: "404: NOT_FOUND" after deploying backend

This happens when Vercel can't find the correct entry point for your serverless functions.

---

## ✅ Solution Applied

I've updated your backend to use Vercel's serverless functions properly:

### Changes Made:

1. **Created `api/index.js`** - Serverless function entry point
2. **Updated `server.js`** - Conditional listening for local vs serverless
3. **Updated `vercel.json`** - Points to API directory

### File Structure:
```
backend/
├── api/
│   └── index.js          ← NEW: Vercel serverless entry point
├── server.js             ← UPDATED: Exports app, conditional listen
├── vercel.json           ← UPDATED: Points to api/index.js
├── routes/
├── controllers/
└── middleware/
```

---

## 🚀 How to Redeploy

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your backend project on Vercel
2. Click "Redeploy" 
3. Wait for deployment to complete
4. Test: `https://your-backend.vercel.app/api/health`

### Option 2: Via CLI

```powershell
cd backend
git add .
git commit -m "Fix serverless configuration for Vercel"
git push origin main
```

Vercel will auto-deploy from GitHub.

---

## ✅ Testing Your Deployment

After redeployment, test these endpoints:

### 1. Health Check
```
GET https://YOUR-BACKEND-URL.vercel.app/api/health
```

Expected response:
```json
{
  "name": "ArenaX Gaming API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 2. Get Tournaments
```
GET https://YOUR-BACKEND-URL.vercel.app/api/tournaments
```

### 3. Payment Routes
```
POST https://YOUR-BACKEND-URL.vercel.app/api/payment/create-order
GET  https://YOUR-BACKEND-URL.vercel.app/api/payment/verify/:orderId
```

---

## 🔍 Still Getting 404?

### Check These:

1. **Correct URL:**
   - Make sure you're accessing `https://YOUR-PROJECT.vercel.app/api/health`
   - Not just `https://YOUR-PROJECT.vercel.app`

2. **Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure all required variables are set:
     ```
     SUPABASE_URL
     SUPABASE_ANON_KEY
     SUPABASE_SERVICE_KEY
     CASHFREE_APP_ID
     CASHFREE_SECRET_KEY
     FRONTEND_URL
     NODE_ENV=production
     ```

3. **Build Logs:**
   - Check Vercel deployment logs for errors
   - Look for "Function compiled successfully"

4. **Function Logs:**
   - After deployment, go to Functions tab
   - Check if index.js is listed and active

---

## 🎯 Expected Behavior

✅ Working deployment shows:
- Health check returns 200 OK
- API routes respond correctly
- No 404 errors in browser console
- Functions execute without timeout

❌ Broken deployment shows:
- 404 on all routes
- "Function not found" errors
- Build failures in logs

---

## 💡 Pro Tips

1. **Test Locally First:**
   ```powershell
   cd backend
   npm install
   node server.js
   # Visit http://localhost:5000/api/health
   ```

2. **Check Vercel Logs:**
   - Deployment logs show build process
   - Function logs show runtime errors

3. **Use Vercel CLI:**
   ```powershell
   vercel --prod
   ```

4. **Clear Cache:**
   If issues persist, try:
   ```powershell
   vercel --rm
   vercel --prod
   ```

---

## 📞 Quick Reference

**Backend URL Format:**
```
https://[project-name].vercel.app/api/[endpoint]
```

**Example:**
```
https://arenax-gaming-backend.vercel.app/api/health
https://arenax-gaming-backend.vercel.app/api/tournaments
```

---

## 🎉 Success Indicators

Your fix worked when:
- ✅ `/api/health` returns 200 with JSON response
- ✅ Other API routes work correctly
- ✅ No 404 errors
- ✅ Functions show as "Ready" in Vercel dashboard

---

**Last Updated:** March 21, 2026  
**Status:** Configuration fixed - Ready to redeploy
