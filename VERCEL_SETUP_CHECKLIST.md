# Vercel + PostgreSQL - Quick Setup Checklist

Copy this and follow step-by-step. Takes ~2 hours total.

---

## ✅ Pre-Setup (5 minutes)

- [ ] Have GitHub account ready
- [ ] Gather these values (write them down):
  - [ ] GitHub repo URL: `https://github.com/your-username/postiz-app`
  - [ ] A random 32-char string for JWT_SECRET: (use `openssl rand -base64 32` or online generator)

---

## ✅ Phase 1: Setup Vercel Frontend (20 minutes)

### 1.1 Create Vercel Account

- [ ] Go to https://vercel.com
- [ ] Click "Sign Up"
- [ ] Select "Sign up with GitHub"
- [ ] Authorize Vercel

### 1.2 Create PostgreSQL Database

- [ ] In Vercel Dashboard, go to **Storage**
- [ ] Click **"Create New"** → **"Postgres"**
- [ ] Select your region
- [ ] Click **"Create"**
- [ ] **Copy connection string** and save it:
  ```
  postgresql://user:password@host:5432/dbname
  ```

### 1.3 Import Frontend Project

- [ ] Vercel Dashboard → **"Add New"** → **"Project"**
- [ ] Click **"Import Git Repository"**
- [ ] Search for: `postiz-app`
- [ ] Select your repo
- [ ] Click **"Import"**

### 1.4 Configure Frontend Settings

- [ ] Under **"Project Settings"**:
  - [ ] **Framework Preset:** Next.js
  - [ ] **Root Directory:** `./apps/frontend` ⬅️ IMPORTANT!
  - [ ] Build Command: `leave default`
  - [ ] Output Directory: `leave default`

### 1.5 Add Frontend Environment Variables

- [ ] Click **"Add Environment Variables"**
- [ ] Add these variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend-url.railway.app` (we'll update this later) |
| `FRONTEND_URL` | `https://postiz-xxxxx.vercel.app` (Vercel will assign this) |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://...` (paste from Step 1.2) |

- [ ] Click **"Deploy"**
- [ ] **Wait 3-5 minutes** for deployment

### 1.6 Get Frontend URL

- [ ] Once deployed, copy the URL shown:
  ```
  https://postiz-xxxxx.vercel.app
  ```
- [ ] **Save this URL** - you'll need it for backend

---

## ✅ Phase 2: Setup Backend (Choose One - 30 minutes)

### OPTION A: Deploy on Railway (Recommended)

#### A1. Create Railway Account

- [ ] Go to https://railway.app
- [ ] Click "Login with GitHub"
- [ ] Authorize Railway

#### A2. Create Backend Project

- [ ] Dashboard → **"New Project"**
- [ ] Select **"Deploy from GitHub repo"**
- [ ] Search for: `postiz-app`
- [ ] Select repo
- [ ] Railway will auto-detect services

#### A3. Configure Backend Service

- [ ] In Railway, find **"postiz-backend"** service
- [ ] Go to **"Settings"**
- [ ] Update **Build Command:**
  ```
  pnpm install --frozen-lockfile && pnpm run build:backend
  ```

- [ ] Update **Start Command:**
  ```
  pnpm run --filter ./apps/backend start
  ```

#### A4. Add Backend Environment Variables

- [ ] In Railway, go to **"Variables"**
- [ ] Click **"Add Variable"** and add these:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NODE_OPTIONS` | `--max-old-space-size=512` |
| `DATABASE_URL` | `postgresql://...` (from Vercel Step 1.2) |
| `FRONTEND_URL` | `https://postiz-xxxxx.vercel.app` (from Step 1.6) |
| `NEXT_PUBLIC_BACKEND_URL` | (leave empty for now) |
| `BACKEND_INTERNAL_URL` | `http://localhost:3000` |
| `JWT_SECRET` | (your 32-char random string) |
| `STORAGE_PROVIDER` | `local` |

#### A5. Deploy Backend

- [ ] Click **"Deploy"**
- [ ] **Wait 3-5 minutes**
- [ ] Once deployed, go to **"Settings"** → **"Domains"**
- [ ] Copy your backend URL:
  ```
  https://postiz-backend-xxxxx.railway.app
  ```
- [ ] **Save this URL**

---

### OPTION B: Deploy on Render

#### B1. Create Render Account

- [ ] Go to https://render.com
- [ ] Click "Sign up with GitHub"
- [ ] Authorize Render

#### B2. Create Backend Service

- [ ] Dashboard → **"New"** → **"Web Service"**
- [ ] Select your GitHub repo: `postiz-app`
- [ ] Click **"Connect"**

#### B3. Configure Backend

- [ ] **Name:** `postiz-backend`
- [ ] **Runtime:** Node
- [ ] **Build Command:**
  ```
  pnpm install --frozen-lockfile && pnpm run build:backend
  ```

- [ ] **Start Command:**
  ```
  pnpm run --filter ./apps/backend start
  ```

- [ ] **Plan:** Starter ($7/month)
- [ ] Click **"Create Web Service"**

#### B4. Add Environment Variables

Once created, go to **"Settings"** and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `NODE_OPTIONS` | `--max-old-space-size=512` |
| `DATABASE_URL` | `postgresql://...` (from Vercel Step 1.2) |
| `FRONTEND_URL` | `https://postiz-xxxxx.vercel.app` (from Step 1.6) |
| `NEXT_PUBLIC_BACKEND_URL` | (leave empty for now) |
| `BACKEND_INTERNAL_URL` | `http://localhost:3000` |
| `JWT_SECRET` | (your 32-char random string) |
| `STORAGE_PROVIDER` | `local` |

#### B5 Deploy

- [ ] Click **"Deploy"**
- [ ] **Wait 3-5 minutes**
- [ ] Once deployed, get your backend URL from the service page:
  ```
  https://postiz-backend-xxxxx.onrender.com
  ```
- [ ] **Save this URL**

---

## ✅ Phase 3: Connect Frontend to Backend (10 minutes)

### 3.1 Update Frontend Environment Variables

Now that you have the backend URL:

- [ ] Go to **Vercel Dashboard** → Your Project
- [ ] Click **"Settings"** → **"Environment Variables"**
- [ ] Find `NEXT_PUBLIC_BACKEND_URL`
- [ ] Update value to your backend URL:
  ```
  https://postiz-backend-xxxxx.railway.app (or onrender.com)
  ```

- [ ] Click **"Save"**

### 3.2 Redeploy Frontend

- [ ] **Vercel Dashboard** → **"Deployments"**
- [ ] Find the latest deployment
- [ ] Click **"..."** → **"Redeploy"**
- [ ] Click **"Redeploy"** again to confirm
- [ ] **Wait 2-3 minutes**

---

## ✅ Phase 4: Initialize Database (10 minutes)

### 4.1 Connect to Backend Shell

**If using Railway:**
- [ ] Railway Dashboard → Your Backend Service
- [ ] Click **"Shell"** tab
- [ ] You'll see a terminal

**If using Render:**
- [ ] Render Dashboard → Your Backend Service
- [ ] Click **"Shell"** tab
- [ ] You'll see a terminal

### 4.2 Run Migrations

In the terminal, run:
```bash
pnpm run prisma-db-push
```

Wait for it to complete. You should see:
```
✔ Database synced, created X tables
```

---

## ✅ Phase 5: Test Everything (15 minutes)

### 5.1 Test Frontend

- [ ] Open your Vercel URL in browser:
  ```
  https://postiz-xxxxx.vercel.app
  ```

- [ ] You should see:
  - [ ] Postiz app loading
  - [ ] No errors in console
  - [ ] Can navigate pages

### 5.2 Test Backend

- [ ] Visit backend health check:
  ```
  https://postiz-backend-xxxxx.railway.app/health
  ```

- [ ] You should see:
  ```json
  {"status":"ok"}
  ```

### 5.3 Test Sign Up

- [ ] Go back to frontend
- [ ] Try to sign up with test account:
  - [ ] Email: `test@example.com`
  - [ ] Password: `TestPassword123!`

- [ ] If successful:
  - [ ] Database is connected ✅
  - [ ] Backend is working ✅
  - [ ] Frontend can communicate ✅

---

## ✅ Phase 6: Setup Auto-Deploy (5 minutes)

Both Vercel and Railway/Render auto-deploy from GitHub!

- [ ] **Just push to main branch:**
  ```bash
  git add .
  git commit -m "Update deployment"
  git push origin main
  ```

- [ ] Both services will auto-redeploy
- [ ] Check deployments tab after 2-3 minutes
- [ ] Your app is updated! ✅

---

## 📝 Important URLs and Credentials

Save these somewhere safe (1Password, Notion, etc):

```
FRONTEND URL:
https://postiz-xxxxx.vercel.app

BACKEND URL:
https://postiz-backend-xxxxx.railway.app

DATABASE CONNECTION STRING:
postgresql://user:pass@host:5432/db

VERCEL DASHBOARD:
https://vercel.com/dashboard

RAILWAY/RENDER DASHBOARD:
https://railway.app or https://render.com
```

---

## ⚠️ If Something Breaks

### Frontend won't build
- [ ] Check Vercel Deployments tab
- [ ] Look at build logs
- [ ] Most common: wrong root directory (should be `./apps/frontend`)

### Backend won't start
- [ ] Check Railway/Render Deployments tab
- [ ] Check environment variables (especially DATABASE_URL)
- [ ] Make sure all required env vars are set

### Can't sign up
- [ ] Backend health check returning error
- [ ] DATABASE_URL not set in backend
- [ ] Database migrations not run (run Step 4.2 again)

### Database connection failed
- [ ] Verify CONNECTION_STRING format
- [ ] Backend IP might not be allowlisted (Vercel handles this automatically)

---

## 🎉 Success Indicators

You're done when:

- [ ] Frontend loads at vercel.app URL
- [ ] Backend health check works
- [ ] Can sign up and log in
- [ ] No errors in console
- [ ] Auto-deploy working (push to GitHub = auto-deploy)

---

## 💰 Costs Summary

| Service | First 3 Months | After 3 Months |
|---------|----------------|----------------|
| Vercel Frontend | FREE | FREE |
| Vercel PostgreSQL | FREE | $30/month |
| Railway Backend | $5-10/month | $5-10/month |
| **TOTAL** | **$5-10/month** | **$35-40/month** |

At just 2 paying customers ($29/month each = $58/month), you're already profitable! 🎉

---

## 📞 Next Steps

- [ ] Follow this checklist step-by-step
- [ ] Deploy frontend on Vercel
- [ ] Deploy backend on Railway/Render
- [ ] Test everything
- [ ] Read MONETIZATION_PLAN.md to set up Stripe
- [ ] Invite beta users
- [ ] Launch!

---

**Estimated time: 2 hours total**
**Cost: $0-15/month for first 3 months**
**Result: Production-ready app with no cold starts!** 🚀
