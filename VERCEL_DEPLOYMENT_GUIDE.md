# Vercel Deployment Guide for ArenaX Gaming

## 🚀 Quick Deploy Steps

### Step 1: Prepare Your Repository
✅ Already done! Your code is pushed to: https://github.com/rkking8379-tech/ArenaX-Gaming.git

### Step 2: Deploy Frontend to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "Add New Project"

2. **Import Your Repository**
   - Select "Import Git Repository"
   - Choose `rking8379-tech/ArenaX-Gaming`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `frontend` (click "Edit" and select this)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 3: Backend Deployment Options

Since Vercel is primarily for frontend/serverless, you have these options for the backend:

#### Option 1: Railway (Recommended - Free Tier Available)
1. Go to [Railway](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select `ArenaX-Gaming` repository
4. Set root directory to `backend`
5. Add environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   PORT=5000
   NODE_ENV=production
   ```
6. Deploy and get your backend URL
7. Update frontend's `NEXT_PUBLIC_API_URL` in Vercel

#### Option 2: Render (Free Tier)
1. Go to [Render](https://render.com)
2. New Web Service → Connect GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables (same as Railway)

#### Option 3: Convert to Vercel Serverless Functions
Move backend routes to `frontend/pages/api/` or `frontend/app/api/`

Example structure:
```
frontend/
├── app/
│   └── api/
│       ├── tournaments/
│       │   └── route.ts
│       └── auth/
│           └── route.ts
```

### Step 4: Update Environment Variables

After backend deployment:

1. **In Vercel Dashboard:**
   - Go to your project Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your deployed backend URL
   - Redeploy

2. **Update Supabase CORS Settings:**
   - Go to Supabase Dashboard → API Settings
   - Add your Vercel domain to allowed origins:
     ```
     https://your-app.vercel.app
     https://*.vercel.app
     ```

### Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test signup/login
3. Check tournament listing
4. Verify database connections

## 🔧 Troubleshooting

### Build Errors
- Check Node version compatibility (Vercel uses Node 18+ by default)
- Ensure all dependencies are in package.json
- Run `npm run build` locally first to catch errors

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Supabase RLS Errors
- Make sure RLS policies allow public access where needed
- Check service role vs anon key usage

## 📊 Post-Deployment Checklist

- ✅ Frontend loads correctly
- ✅ All pages render properly
- ✅ Authentication works
- ✅ API calls succeed
- ✅ Database queries work
- ✅ Mobile responsive
- ✅ Custom domain (optional)

## 🎯 Production Tips

1. **Enable Vercel Analytics**
2. **Set up custom domain**
3. **Configure caching headers**
4. **Enable automatic deployments from main branch**
5. **Set up preview deployments for PRs**
6. **Monitor performance in Vercel dashboard**

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Vercel Integration](https://supabase.com/docs/guides/getting-started/quickstarts/vercel-nextjs)
- [Railway Deployment Guide](https://docs.railway.app/deploy)

---

**Need help?** Check the troubleshooting section or contact support!
