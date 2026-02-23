# Vercel Deployment Guide for Elite Drive

## Why the 404 Error Occurred

The **404: NOT_FOUND** error on Vercel happened because:

1. ✗ Your project is a **monorepo** with `frontend/` and `backend/` folders
2. ✗ Vercel tried to deploy from the **root directory**
3. ✗ No `vercel.json` configuration existed to tell Vercel where the frontend app is
4. ✗ Vercel couldn't find the build output (`dist` folder)

## Solution Implemented

I've created a `vercel.json` configuration file at the root that tells Vercel:
- ✅ The frontend app is in the `frontend/` directory
- ✅ Build command: `cd frontend && npm install && npm run build`
- ✅ Output directory: `frontend/dist`
- ✅ Framework: Vite
- ✅ SPA routing: All routes redirect to `/index.html` (for React Router)

---

## Step-by-Step Deployment Instructions

### 1. Commit and Push the New Configuration

```bash
git add vercel.json
git commit -m "feat: add Vercel deployment configuration"
git push origin main
```

### 2. Configure Vercel Project Settings

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel project** → Settings → General

2. **Set Build & Development Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (leave as root since vercel.json handles it)
   - **Build Command:** Leave empty (vercel.json handles it)
   - **Output Directory:** Leave empty (vercel.json handles it)
   - **Install Command:** Leave empty (vercel.json handles it)

3. **Click "Save"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd c:\xampp\htdocs\pfe-main
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Vercel will detect the vercel.json configuration
```

### 3. Set Environment Variables

**Important:** Your frontend needs to know where the backend API is.

#### In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** 
     - For production: `https://your-backend-api.com/api`
     - For development/testing: `http://localhost:8000/api`
   - **Environment:** Select `Production`, `Preview`, and `Development`
3. Click **Save**

#### Using Vercel CLI:

```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend-api.com/api

vercel env add VITE_API_URL preview
# Enter: https://your-staging-api.com/api (or same as production)
```

### 4. Redeploy

After adding environment variables, trigger a redeploy:

#### Via Dashboard:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

#### Via CLI:
```bash
vercel --prod
```

---

## Troubleshooting

### Issue 1: Still Getting 404

**Check:**
- Ensure `vercel.json` is committed and pushed to GitHub
- Verify Vercel is pulling from the correct branch (`main`)
- Check deployment logs in Vercel dashboard for build errors

**Solution:**
```bash
# Force a new deployment
git commit --allow-empty -m "chore: trigger Vercel redeploy"
git push origin main
```

### Issue 2: Build Fails

**Possible causes:**
- Missing dependencies
- Node version mismatch
- Environment variables not set

**Solution:**
1. Check **Deployment Logs** in Vercel dashboard
2. Look for error messages in the build output
3. Ensure `frontend/package.json` has all dependencies

**Set Node.js version** (if needed):
Add to `vercel.json`:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "framework": "vite",
  "engines": {
    "node": "18.x"
  }
}
```

### Issue 3: Routes Return 404 (e.g., /vehicles, /dashboard)

This happens if React Router routes aren't configured properly.

**Already Fixed:** The `vercel.json` includes:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```
This ensures all routes load the React app.

### Issue 4: API Calls Fail

**Check:**
1. `VITE_API_URL` environment variable is set in Vercel
2. Backend API is accessible from Vercel (not localhost!)
3. CORS is configured on backend to allow Vercel domain

**Backend CORS fix** (if needed):

In `backend/config/cors.php`:
```php
'allowed_origins' => [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com',
],
```

Or use wildcard for testing:
```php
'allowed_origins' => ['*'],
```

---

## Project Structure for Vercel

```
pfe-main/
├── vercel.json          ← Deployment configuration (NEW!)
├── backend/             ← Laravel API (deploy separately)
│   ├── app/
│   ├── routes/
│   └── ...
└── frontend/            ← React app (Vercel deploys this)
    ├── src/
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── dist/            ← Build output (created during deployment)
```

---

## Deployment Checklist

Before deploying to Vercel:

### Frontend
- [x] `vercel.json` created at root
- [ ] Environment variables set (`VITE_API_URL`)
- [ ] Build works locally: `cd frontend && npm run build`
- [ ] Preview works: `npm run preview`
- [ ] All routes work in production build
- [ ] API calls use `import.meta.env.VITE_API_URL`

### Backend (Deploy Separately)
- [ ] Backend deployed (recommend: Railway, Render, DigitalOcean, AWS)
- [ ] Database accessible from backend host
- [ ] CORS configured for Vercel domain
- [ ] Environment variables set (.env)
- [ ] Sanctum configured for frontend domain

### After Deployment
- [ ] Test all routes work
- [ ] Test authentication (login/register)
- [ ] Test API calls (vehicles, reservations, pricing)
- [ ] Test protected routes (dashboard)
- [ ] Check browser console for errors

---

## Recommended Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│  Vercel (Frontend - React + Vite)              │
│  https://elite-drive.vercel.app                 │
│                                                  │
│  - Serves static files (HTML, CSS, JS)         │
│  - Handles client-side routing                  │
│  - Makes API calls to backend                   │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS API Calls
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Railway/Render (Backend - Laravel)             │
│  https://elite-drive-api.railway.app/api        │
│                                                  │
│  - Handles authentication (Sanctum)             │
│  - Processes reservations                        │
│  - Dynamic pricing calculations                  │
│  - Database operations                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Database (MySQL/PostgreSQL)                    │
│  - Hosted on Railway/Render/PlanetScale         │
└─────────────────────────────────────────────────┘
```

---

## Alternative: Deploy Backend to Vercel

If you want to deploy both frontend and backend to Vercel:

1. **Create separate Vercel projects:**
   - `elite-drive-frontend` (from `frontend/`)
   - `elite-drive-api` (from `backend/`)

2. **Backend vercel.json** (in `backend/`):
```json
{
  "version": 2,
  "functions": {
    "api/index.php": {
      "runtime": "vercel-php@0.6.0"
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.php"
    }
  ]
}
```

**Note:** Laravel on Vercel is possible but not ideal. Better options:
- **Railway** (recommended for Laravel)
- **Render**
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**

---

## Quick Deploy Commands

```bash
# 1. Commit vercel.json
git add vercel.json VERCEL_DEPLOYMENT.md
git commit -m "feat: add Vercel deployment configuration and guide"
git push origin main

# 2. Install Vercel CLI (if not installed)
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy
cd c:\xampp\htdocs\pfe-main
vercel --prod

# 5. Set environment variables
vercel env add VITE_API_URL production
# Paste: https://your-backend-api.com/api
```

---

## What Happens During Deployment

1. **Vercel clones** your GitHub repo
2. **Reads** `vercel.json` configuration
3. **Runs** `cd frontend && npm install`
4. **Builds** with `npm run build` (creates `frontend/dist/`)
5. **Deploys** static files from `frontend/dist/` to Vercel CDN
6. **Configures** routing (all requests → `/index.html`)
7. **Sets** environment variables
8. **Provides** deployment URL (e.g., `https://elite-drive-abc123.vercel.app`)

---

## Testing Your Deployment

After deployment succeeds:

```bash
# Test routes
curl https://your-app.vercel.app/
curl https://your-app.vercel.app/vehicles
curl https://your-app.vercel.app/dashboard

# All should return the same HTML (React app)
```

**In browser:**
1. Visit `https://your-app.vercel.app`
2. Navigate to different pages
3. Check browser console (F12) for errors
4. Test login/register
5. Test API calls (check Network tab)

---

## Important Notes

### Environment Variables in Vite

Vite only exposes variables prefixed with `VITE_`:

✅ **Correct:**
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

❌ **Wrong:**
```javascript
const apiUrl = process.env.API_URL; // Won't work!
```

### Update Your Frontend Code

Ensure all API calls use the environment variable:

**In `frontend/src/hooks/usePricing.js`:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

**In authentication context:**
```javascript
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
```

---

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vite Deployment Guide:** https://vitejs.dev/guide/static-deploy.html#vercel
- **Vercel Community:** https://github.com/vercel/vercel/discussions

---

## Next Steps After First Deployment

1. ✅ **Add custom domain** (Settings → Domains)
2. ✅ **Enable automatic deployments** (Settings → Git)
3. ✅ **Set up production backend** (Railway/Render)
4. ✅ **Configure production database**
5. ✅ **Update CORS settings** on backend
6. ✅ **Test end-to-end flow**
7. ✅ **Monitor deployment analytics** (Vercel dashboard)
8. ✅ **Set up error tracking** (Sentry, LogRocket)

---

**Created:** February 23, 2026  
**Last Updated:** February 23, 2026  
**Deployment Target:** Vercel  
**Framework:** React + Vite  
**API:** Laravel (separate deployment)
