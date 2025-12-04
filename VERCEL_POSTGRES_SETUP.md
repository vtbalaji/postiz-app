# Vercel + PostgreSQL Deployment Guide

Deploy Postiz on **Vercel (Frontend) + Vercel PostgreSQL Database**.

This gives you:
- ✅ No cold starts
- ✅ Unlimited bandwidth
- ✅ Better performance
- ✅ Simple setup
- ✅ Truly FREE or very cheap

---

## 🎯 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Your Users                            │
└──────────────────┬───────────────────────────────────────┘
                   │
         ┌─────────▼────────────┐
         │   Vercel Frontend    │
         │   (Next.js App)      │
         │   *.vercel.app       │
         └──────────┬───────────┘
                    │
         ┌──────────▼──────────┐
         │  Vercel Postgres    │
         │  (Database)         │
         └─────────────────────┘

Backend Options:
├─ Railway ($5-10/month)
├─ Render ($7-42/month)
└─ Fly.io ($5-15/month)
```

---

## 💰 Pricing (Vercel + Database)

### Vercel Hosting
- **Frontend:** FREE (Hobby tier)
- **Auto-scaling:** FREE up to certain limits
- **SSL/HTTPS:** FREE
- **Domain:** FREE (*.vercel.app)

### Vercel PostgreSQL Database
- **First 3 months:** FREE ($200 credit)
- **After 3 months:** $30/month for starter tier

### Backend (separate from Vercel)
- **Option 1 - Railway:** $5-10/month
- **Option 2 - Render:** $7-42/month
- **Option 3 - Fly.io:** $5-15/month

**Total First 3 Months:** $0-15/month
**After 3 Months:** $35-60/month

---

## 📋 What You Need

Before starting, gather:
1. GitHub account (for Vercel deploy)
2. Vercel account (free)
3. A backend hosting choice (Railway/Render/Fly.io)

---

## 🚀 Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click "Sign Up"
3. Choose "Sign up with GitHub"
4. Authorize Vercel to access your repos
5. Done!

---

## 🗄️ Step 2: Create PostgreSQL Database on Vercel

1. Go to **Vercel Dashboard** → **Storage**
2. Click "Create New" → "Postgres"
3. Select region (closest to users)
4. Click "Create"
5. **Copy the connection string** (you'll need this)

Example connection string:
```
postgresql://user:password@host.postgres.vercel.sh:5432/dbname
```

**Free tier includes:**
- ✅ 256MB storage
- ✅ 60 connections
- ✅ Perfect for MVP

---

## 📤 Step 3: Deploy Frontend to Vercel

### 3.1 Import Repository

1. Vercel Dashboard → **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Search for: **postiz-app**
4. Select your fork/repo
5. Click **"Import"**

### 3.2 Configure Project

1. **Project Settings:**
   - Framework: **Next.js**
   - Root Directory: **`./apps/frontend`** ← IMPORTANT!
   - Build Command: Leave default (Next.js auto-detects)
   - Output Directory: Leave default

2. **Environment Variables:**

Click "Add Environment Variables" and set these:

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
DATABASE_URL=postgresql://... (from step 2)
```

3. Click **"Deploy"**

**Wait 2-5 minutes for deployment to complete.**

### 3.3 Get Your Frontend URL

Once deployed, you'll see:
```
https://postiz-frontend-xxxxx.vercel.app
```

Copy this URL - you'll need it for the backend.

---

## 🔧 Step 4: Deploy Backend (Choose One Option)

### Option A: Deploy Backend on Railway (Recommended - $5-10/month)

**Railway Setup:**

1. Go to **https://railway.app**
2. Sign up with GitHub
3. Go to Dashboard
4. Click **"New Project"** → **"Deploy from GitHub repo"**
5. Select **postiz-app** repo
6. Wait for initial detection

**Configure Backend Service:**

1. Click **"postiz-backend"** service
2. Go to **Settings**
3. Update **Build Command:**
   ```
   pnpm install --frozen-lockfile && pnpm run build:backend
   ```

4. Update **Start Command:**
   ```
   pnpm run --filter ./apps/backend start
   ```

5. Add **Environment Variables:**
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=512
   DATABASE_URL=postgresql://... (from Vercel Step 2)
   REDIS_URL=(skip for now, or use Railway Redis)
   FRONTEND_URL=https://postiz-frontend-xxxxx.vercel.app
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend.railway.app
   BACKEND_INTERNAL_URL=http://localhost:3000
   JWT_SECRET=(generate random 32-char string)
   STORAGE_PROVIDER=local
   ```

6. Deploy

**Get your backend URL from Railway:**
```
https://your-backend-xxxxx.railway.app
```

---

### Option B: Deploy Backend on Render ($7-42/month)

1. Go to **https://render.com**
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect **postiz-app** repo
5. Configure:
   - Name: `postiz-backend`
   - Runtime: **Node**
   - Build Command: `pnpm install --frozen-lockfile && pnpm run build:backend`
   - Start Command: `pnpm run --filter ./apps/backend start`
   - Plan: **STARTER ($7/month)**

6. Add environment variables (same as Railway above)
7. Deploy

**Get your backend URL:**
```
https://postiz-backend-xxxxx.onrender.com
```

---

### Option C: Deploy Backend on Fly.io ($5-15/month)

1. Go to **https://fly.io**
2. Sign up with GitHub
3. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
4. Run: `flyctl launch`
5. Follow prompts to deploy

---

## 🔗 Step 5: Connect Frontend to Backend

Now update your Vercel frontend with the backend URL:

1. **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_BACKEND_URL` to your backend URL from Step 4
3. Redeploy by pushing to GitHub (or click Redeploy in Vercel)

---

## 💾 Step 6: Run Database Migrations

Your backend needs to initialize the database:

### If using Railway Backend:

1. Railway Dashboard → Your Backend Service
2. Click **"Shell"** tab
3. Run:
   ```
   pnpm run prisma-db-push
   ```

### If using Render Backend:

1. Render Dashboard → Your Backend Service
2. Click **"Shell"** tab
3. Run:
   ```
   pnpm run prisma-db-push
   ```

### If using Fly.io Backend:

1. Run locally:
   ```
   export DATABASE_URL=postgresql://... (your Vercel Postgres URL)
   pnpm run prisma-db-push
   ```

---

## ✅ Step 7: Test Everything

### Test Frontend
Visit: `https://your-app.vercel.app`
- Should load without errors
- Should see your Postiz app

### Test Backend Connection
Visit: `https://your-backend.railway.app/health`
- Should return `{"status":"ok"}` or similar

### Test Database
Try signing up in your frontend
- Should create user in database
- Should log in successfully

---

## 🎯 What You Get

### Vercel (Frontend)
- ✅ Auto-scales to millions of users
- ✅ No cold starts
- ✅ Unlimited bandwidth
- ✅ Global CDN
- ✅ Auto-deploy on git push
- ✅ Custom domain support
- ✅ Automatic SSL

### Vercel PostgreSQL
- ✅ First 3 months FREE
- ✅ After: $30/month
- ✅ 256MB storage (enough for MVP)
- ✅ Automatic backups
- ✅ Connection pooling

### Backend (Railway/Render/Fly.io)
- ✅ Always responsive (no cold starts)
- ✅ Auto-deploy from GitHub
- ✅ Environment variables managed
- ✅ Auto-scaling available

---

## 📊 Cost Breakdown

### Year 1: With FREE Vercel PostgreSQL Credit

```
Months 1-3:
├─ Vercel Frontend: FREE
├─ Vercel PostgreSQL: FREE (credit)
├─ Backend (Railway): $0-20 (if they have credit)
├─ Total: $0-20
└─ Profit: ✅ (if 2+ paying customers)

Months 4-12:
├─ Vercel Frontend: FREE
├─ Vercel PostgreSQL: $30/month
├─ Backend (Railway): $5-10/month
├─ Total: $35-40/month
└─ Profit: ✅ (if 3+ paying customers at $29)
```

**Much better than $42/month from day 1!**

---

## 🔄 Auto-Deploy from GitHub

Everything auto-deploys when you push:

1. **Frontend:** Push to `main` → Vercel auto-deploys
2. **Backend:** Push to `main` → Railway/Render auto-deploys
3. **Database:** Migrations run manually or via script

No manual steps needed after initial setup!

---

## 📝 Environment Variables Reference

### Frontend (.env for Vercel)
```
NEXT_PUBLIC_BACKEND_URL=https://backend-url.railway.app
FRONTEND_URL=https://frontend.vercel.app
NODE_ENV=production
```

### Backend (.env for Railway/Render)
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=(optional)
FRONTEND_URL=https://frontend.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://backend-url.railway.app
BACKEND_INTERNAL_URL=http://localhost:3000
JWT_SECRET=your-random-32-char-secret
STORAGE_PROVIDER=local

# Add your social media API keys
X_API_KEY=
X_API_SECRET=
LINKEDIN_CLIENT_ID=
# etc...
```

---

## ⚡ Performance Benefits

### Why This Setup is Better

1. **Vercel Frontend**
   - Global CDN = super fast everywhere
   - No cold starts
   - Optimized for Next.js
   - Best-in-class performance

2. **Vercel PostgreSQL**
   - Same region as frontend = fast queries
   - Modern managed database
   - Automatic backups

3. **Backend on Railway/Render/Fly**
   - Multiple options = flexibility
   - No cold starts (unlike FREE tier)
   - Auto-scaling ready
   - Better uptime

---

## 🚨 Limitations (Very Few)

- **PostgreSQL:** 256MB storage (enough for 100-500 active users)
- **Backend:** Depends on your choice (Railway/Render/Fly all good)
- **After 3 months:** PostgreSQL becomes $30/month

---

## 💡 Upgrade Path

```
Month 1-3: Vercel FREE + PostgreSQL FREE = $0-5/month profit!
Month 4+: Vercel FREE + PostgreSQL $30 + Backend $7-10 = $37-40/month

At 2 paying customers ($29/month):
├─ Revenue: $58/month
├─ Cost: $40/month
└─ Profit: $18/month ✅

At 5 paying customers:
├─ Revenue: $145/month
├─ Cost: $40/month
└─ Profit: $105/month ✅
```

---

## 📚 Quick Reference

| Service | Cost | Why |
|---------|------|-----|
| Vercel Frontend | FREE | Best Next.js platform |
| Vercel PostgreSQL | FREE (3mo), then $30 | Integrated, convenient |
| Backend (Railway) | $5-10/month | Cheapest, good performance |
| **Total** | **$0-50/month** | Scalable, no cold starts |

---

## 🎬 Next Steps

1. [ ] Create Vercel account (https://vercel.com)
2. [ ] Create PostgreSQL database on Vercel
3. [ ] Deploy frontend to Vercel
4. [ ] Deploy backend to Railway/Render/Fly
5. [ ] Connect them with environment variables
6. [ ] Run database migrations
7. [ ] Test your app
8. [ ] Set up monetization (Stripe/Lemon Squeezy)
9. [ ] Launch!

---

## 🆘 Troubleshooting

### Frontend won't build

**Check:**
- Root Directory is set to `./apps/frontend`
- Node version is compatible
- Environment variables are set

**Fix:**
- Vercel Dashboard → Deployments → View logs
- Look for build errors
- Fix in code, push to GitHub, auto-redeploy

### Backend won't connect to database

**Check:**
- DATABASE_URL is correct format
- Vercel PostgreSQL IP allowlist includes backend
- NEXT_PUBLIC_BACKEND_URL in frontend matches backend URL

**Fix:**
- Copy full connection string from Vercel
- Add to backend environment variables
- Restart backend service

### Database migrations fail

**Check:**
- DATABASE_URL is accessible from backend
- Prisma schema is valid
- No other migrations running

**Fix:**
- Run manually: `pnpm run prisma-db-push`
- Check for schema errors
- Verify database connection

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Fly.io Docs:** https://fly.io/docs
- **Vercel PostgreSQL:** https://vercel.com/docs/storage/postgres

---

**This setup is production-ready, scalable, and much better than the $42/month Render all-in-one.**

Ready to deploy? Let me know if you need help with any step! 🚀
