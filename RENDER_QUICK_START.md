# Render.com Deployment - Quick Start Checklist

## ✅ Pre-Deployment (Completed)

- [x] Repository prepared with `render.yaml`
- [x] Node version compatibility updated
- [x] Prisma client generation fixed
- [x] Local build tested (backend & frontend both work)
- [x] Changes committed and pushed to GitHub

## 📋 Next Steps (Follow in Order)

### Step 1: Create Render Account (5 minutes)

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your GitHub repos

### Step 2: Set Up Databases (10 minutes)

**Create PostgreSQL Database:**
1. Dashboard → "New" → "PostgreSQL"
2. Name: `postiz-postgres`
3. Database: `postiz_db`
4. Username: `postiz_user`
5. Region: Choose closest to you
6. Plan: **Starter** ($7/month) or **Free** (limited, 90-day expiry)
7. Click "Create Database"
8. Copy the connection string (you'll need it later)

**Create Redis Service:**
1. Dashboard → "New" → "Redis"
2. Name: `postiz-redis`
3. Region: Same as PostgreSQL
4. Plan: **Starter** ($7/month) or **Free**
5. Click "Create Redis"
6. Copy the connection string

### Step 3: Deploy Backend Service (15 minutes)

1. Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Select the `postiz-app` repo
4. Fill in the details:
   - **Name:** `postiz-backend`
   - **Root Directory:** (leave empty)
   - **Runtime:** Node
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm run build:backend`
   - **Start Command:** `pnpm run --filter ./apps/backend start`
   - **Plan:** Starter ($7/month)

5. Before deploying, add environment variables:
   - `NODE_ENV` = `production`
   - `NODE_OPTIONS` = `--max-old-space-size=512`
   - `DATABASE_URL` = (paste PostgreSQL connection string)
   - `REDIS_URL` = (paste Redis connection string)
   - `FRONTEND_URL` = `https://your-postiz.onrender.com` (you'll set this later)
   - `NEXT_PUBLIC_BACKEND_URL` = `https://postiz-backend-xxx.onrender.com` (Render will assign this)
   - `BACKEND_INTERNAL_URL` = `http://postiz-backend:3000`
   - `JWT_SECRET` = (generate a random 32+ char string)

6. Add other required API keys:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_ACCESS_KEY`
   - `CLOUDFLARE_SECRET_ACCESS_KEY`
   - `CLOUDFLARE_BUCKETNAME`
   - `CLOUDFLARE_BUCKET_URL`
   - Social media API keys (X, LinkedIn, etc.)

7. Click "Create Web Service"
8. Wait for deployment (3-5 minutes)
9. Note the backend URL (e.g., `https://postiz-backend-abc123.onrender.com`)

### Step 4: Deploy Frontend Service (15 minutes)

1. Dashboard → "New" → "Web Service"
2. Select the same `postiz-app` repo
3. Fill in the details:
   - **Name:** `postiz-frontend`
   - **Root Directory:** (leave empty)
   - **Runtime:** Node
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm run build:frontend`
   - **Start Command:** `pnpm run --filter ./apps/frontend start`
   - **Plan:** Starter ($7/month)

4. Add environment variables:
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_BACKEND_URL` = (your backend URL from Step 3)
   - `FRONTEND_URL` = `https://your-postiz.onrender.com`

5. Click "Create Web Service"
6. Wait for deployment (3-5 minutes)
7. Once deployed, note the frontend URL (e.g., `https://postiz-frontend-xyz789.onrender.com`)

### Step 5: Deploy Cron Jobs (5 minutes)

1. Dashboard → "New" → "Cron Job"
2. Fill in:
   - **Name:** `postiz-cron`
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm run build:cron`
   - **Start Command:** `pnpm run --filter ./apps/cron start`
   - **Schedule:** `*/5 * * * *` (runs every 5 minutes)

3. Add environment variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (PostgreSQL connection string)
   - `REDIS_URL` = (Redis connection string)

4. Create

### Step 6: Deploy Workers Service (5 minutes)

1. Dashboard → "New" → "Web Service"
2. Select the same `postiz-app` repo
3. Fill in:
   - **Name:** `postiz-workers`
   - **Runtime:** Node
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm run build:workers`
   - **Start Command:** `pnpm run --filter ./apps/workers start`
   - **Plan:** Starter ($7/month)

4. Add same environment variables as backend
5. Create service

### Step 7: Database Migrations (5 minutes)

Once backend is running:

1. Go to backend service
2. Click "Shell" tab at the top
3. Run: `pnpm run prisma-db-push`
4. Wait for migrations to complete

Alternatively, add to backend's start command (automatic):
```
pnpm run prisma-db-push && pnpm run --filter ./apps/backend start
```

### Step 8: Connect Custom Domain (Optional, 10 minutes)

**For Frontend:**
1. Frontend service → Settings → Custom Domains
2. Add: `postiz.yourdomain.com`
3. Follow DNS instructions to add CNAME record

**For Backend API:**
1. Backend service → Settings → Custom Domains
2. Add: `api.yourdomain.com`
3. Follow DNS instructions

### Step 9: Monitor & Verify (5 minutes)

1. **Backend logs:** Backend service → Logs tab
   - Should see: "NestJS application started on port 3000"

2. **Frontend logs:** Frontend service → Logs tab
   - Should see: "ready - started server"

3. **Test health check:** Open `https://postiz-backend-xxx.onrender.com/health` in browser

---

## 📊 Costs Summary

| Service | Plan | Cost/Month |
|---------|------|-----------|
| PostgreSQL | Starter | $7 |
| Redis | Starter | $7 |
| Backend | Starter | $7 |
| Frontend | Starter | $7 |
| Cron Job | Starter | $7 |
| Workers | Starter | $7 |
| **Total** | | **~$42/month** |

## 🔐 Environment Variables You Need

Before deployment, gather:

```
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_ACCESS_KEY=xxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxx
CLOUDFLARE_BUCKETNAME=xxx
CLOUDFLARE_BUCKET_URL=xxx

JWT_SECRET=your-random-32-char-secret

X_API_KEY=xxx (if using Twitter)
X_API_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# ... other social media APIs
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

Or use this online generator: https://www.uuidgenerator.net/

---

## 🚀 Auto-Deploy from Git

After initial setup, Render will auto-deploy whenever you push to `main`:

1. Push code to GitHub
2. Render detects the push
3. Services rebuild automatically
4. Zero-downtime deployment

---

## 🆘 Troubleshooting

### Build Fails

**Issue:** "Out of memory"
- **Solution:** Already added `NODE_OPTIONS=--max-old-space-size=512`

**Issue:** "Prisma client not found"
- **Solution:** Ensure backend build includes `pnpm run prisma:generate`

**Issue:** "pnpm not found"
- **Solution:** Render should auto-detect pnpm. If not, use `npm install -g pnpm@10.6.1` in build command

### Database Connection Issues

**Issue:** "Cannot connect to database"
- **Solution:** Verify DATABASE_URL format: `postgresql://user:password@host:5432/db`
- Check PostgreSQL service is running (Render dashboard)

### Services Can't Communicate

**Issue:** Backend can't reach Redis/Database
- **Solution:** Use internal connection strings:
  - For internal services: `postiz-redis` (not full URL)
  - Render handles service discovery automatically

---

## 📈 What to Do After Launch

1. **Run database migrations** (see Step 7)
2. **Test the app** at your domain
3. **Set up monitoring** (Sentry integration recommended)
4. **Integrate Stripe/Lemon Squeezy** for payments (see MONETIZATION_PLAN.md)
5. **Start acquiring users** on your freemium tier
6. **Monitor metrics** (MRR, churn, conversion rate)

---

## 📚 Full Documentation

- **Deployment details:** See `DEPLOYMENT_GUIDE.md`
- **Monetization strategy:** See `MONETIZATION_PLAN.md`
- **Render docs:** https://render.com/docs
- **Postiz docs:** https://docs.postiz.com

---

**Total Time to Deploy:** ~1-2 hours for first-time setup
**Your Render Dashboard:** https://dashboard.render.com
