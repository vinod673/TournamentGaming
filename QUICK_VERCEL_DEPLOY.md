# 🚀 Quick Vercel Deployment - 5 Minutes

## ⚡ Fastest Way (Recommended for First Time)

### Step-by-Step (3 minutes):

1. **Go to [vercel.com](https://vercel.com)** → Sign in with GitHub

2. **Click "Add New Project"**

3. **Select your repo:** `rking8379-tech/ArenaX-Gaming`

4. **Configure:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: Click "Edit" → Select **`frontend`**
   - Build Command: `npm run build` (pre-filled)
   - Output Directory: `.next` (pre-filled)

5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:5000/api  (or your backend URL)
   ```

6. **Click "Deploy"** 🎉

Done! Your site will be live at `https://your-app.vercel.app`

---

## 🛠️ Alternative: Using CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend folder
cd frontend
vercel

# Production deploy
vercel --prod
```

---

## 🔧 Backend Options

### Option 1: Keep Backend Separate (Current Setup)
Deploy backend to:
- **Railway** (free tier): railway.app
- **Render** (free tier): render.com
- **Heroku**: heroku.com

Then update `NEXT_PUBLIC_API_URL` in Vercel.

### Option 2: Serverless Functions (Advanced)
Move backend routes to `frontend/app/api/` as route.ts files.

---

## ✅ After Deployment

1. **Update Supabase CORS:**
   - Go to Supabase Dashboard → API Settings
   - Add: `https://*.vercel.app`

2. **Test Everything:**
   - Homepage loads
   - Signup/Login works
   - Tournaments display
   - Database queries work

3. **Custom Domain (Optional):**
   - Vercel Settings → Domains
   - Add your domain

---

## 🆘 Troubleshooting

**Build failed?**
- Check Node version (should be 18+)
- Run `npm run build` locally first

**API not working?**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running

**Supabase errors?**
- Double-check environment variables
- Verify RLS policies allow access

---

## 📊 Next Steps

- Enable auto-deploy from main branch
- Set up preview deployments
- Add custom domain
- Enable Vercel Analytics
- Configure caching

**Need more help?** See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.
