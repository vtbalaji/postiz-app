# Postiz Deployment Guide - Railway & Vercel

## Overview
This guide will help you deploy Postiz to Railway (backend) and Vercel (frontend).

**Repository**: https://github.com/vtbalaji/postiz-app

---

## Prerequisites

✅ Your database and Redis are already set up on Railway:
- **PostgreSQL Internal**: `postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@postgres.railway.internal:5432/railway`
- **PostgreSQL Public**: `postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@trolley.proxy.rlwy.net:55025/railway`
- **Redis Internal**: `redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@redis.railway.internal:6379`
- **Redis Public**: `redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@shuttle.proxy.rlwy.net:12395`

---

## Deployment Option 1: Full Stack on Railway (Simpler)

### Step 1: Deploy to Railway

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Click "New Project"

2. **Connect GitHub Repository**
   - Select "Deploy from GitHub repo"
   - Choose: `vtbalaji/postiz-app`
   - Railway will automatically detect the `railway.toml` file

3. **Add Environment Variables**
   Click on your service → Variables → Add these:

   ```bash
   # Database & Redis (Use INTERNAL URLs)
   DATABASE_URL=postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@postgres.railway.internal:5432/railway
   REDIS_URL=redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@redis.railway.internal:6379

   # JWT Secret (Generate a random string)
   JWT_SECRET=your-very-long-random-jwt-secret-min-32-characters

   # URLs (Will update after first deploy)
   FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   NEXT_PUBLIC_BACKEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
   BACKEND_INTERNAL_URL=http://localhost:3000

   # Storage
   STORAGE_PROVIDER=local
   UPLOAD_DIRECTORY=/app/uploads
   NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY=/uploads

   # Required
   NX_ADD_PLUGINS=false
   IS_GENERAL=true
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy**
   - Click "Deploy"
   - Railway will automatically build and deploy your app
   - Wait for deployment to complete (5-10 minutes)

5. **Get Your URL**
   - After deployment, go to Settings → Networking
   - Generate a domain or use the Railway-provided URL
   - Copy this URL (e.g., `https://postiz-production.up.railway.app`)

6. **Update Environment Variables**
   - Update `FRONTEND_URL` and `NEXT_PUBLIC_BACKEND_URL` with your actual Railway URL
   - Redeploy

---

## Deployment Option 2: Split Deployment (Recommended for Production)

### Part A: Backend on Railway

1. **Create New Railway Project**
   - Go to: https://railway.app/dashboard
   - Click "New Project" → "Empty Project"
   - Name it "Postiz Backend"

2. **Add Backend Service**
   - Click "Add Service" → "GitHub Repo"
   - Select: `vtbalaji/postiz-app`
   - Root Directory: `/` (leave as default)

3. **Add Environment Variables**
   ```bash
   # Database & Redis (INTERNAL URLs for better performance)
   DATABASE_URL=postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@postgres.railway.internal:5432/railway
   REDIS_URL=redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@redis.railway.internal:6379

   # JWT Secret
   JWT_SECRET=your-very-long-random-jwt-secret-min-32-characters

   # URLs
   FRONTEND_URL=https://your-vercel-app.vercel.app
   BACKEND_INTERNAL_URL=http://localhost:3000

   # Storage
   STORAGE_PROVIDER=local
   UPLOAD_DIRECTORY=/app/uploads

   # Required
   NX_ADD_PLUGINS=false
   IS_GENERAL=true
   NODE_ENV=production
   PORT=3000
   ```

4. **Configure Build Settings**
   - Settings → Build
   - Build Command: `pnpm install && pnpm run prisma-generate && pnpm run build:backend && pnpm run build:workers && pnpm run build:cron`
   - Start Command: `pnpm run pm2`

5. **Generate Public Domain**
   - Settings → Networking → Generate Domain
   - Copy the URL (e.g., `https://postiz-backend.up.railway.app`)

### Part B: Frontend on Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Click "Import Git Repository"
   - Select: `vtbalaji/postiz-app`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `apps/frontend`
   - Build Command: `cd ../.. && pnpm install && cd apps/frontend && pnpm run build`
   - Output Directory: `apps/frontend/.next`
   - Install Command: `pnpm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://postiz-backend.up.railway.app
   ```
   (Replace with your actual Railway backend URL from Part A, Step 5)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - Copy your Vercel URL (e.g., `https://postiz-app.vercel.app`)

6. **Update Railway Backend**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy the backend

---

## Post-Deployment Setup

### 1. Generate JWT Secret
If you haven't already, generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Test Your Deployment
1. Visit your frontend URL
2. Try to register a new account
3. Check if you can log in
4. Test connecting a social media account

### 3. Set Up Cloudflare R2 (Recommended)
For production, use Cloudflare R2 for media storage:

1. Create a Cloudflare account
2. Go to R2 → Create bucket
3. Generate API tokens
4. Update Railway environment variables:
   ```bash
   STORAGE_PROVIDER=cloudflare
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   CLOUDFLARE_ACCESS_KEY=your-access-key
   CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-key
   CLOUDFLARE_BUCKETNAME=your-bucket-name
   CLOUDFLARE_BUCKET_URL=https://your-bucket.r2.cloudflarestorage.com/
   CLOUDFLARE_REGION=auto
   ```

---

## Important Notes

### ⚠️ React Version
**DO NOT CHANGE REACT VERSION!**
- Current version: `react@18.3.1`
- Changing this will cause dependency failures
- Do not run `npm update react` or similar commands

### Database Migrations
The deployment automatically runs `prisma-db-push` to update your database schema.

### Logs & Debugging
- **Railway Logs**: Dashboard → Your Service → Deployments → View Logs
- **Vercel Logs**: Dashboard → Your Project → Deployments → View Function Logs

### Environment Variables Reference
All environment variables are documented in `.env.example`

---

## Troubleshooting

### Build Fails on Railway
1. Check logs in Railway dashboard
2. Ensure all environment variables are set
3. Verify database is accessible using internal URLs
4. Check Node.js version (requires >=22.12.0 <23.0.0)

### Frontend Can't Connect to Backend
1. Verify `NEXT_PUBLIC_BACKEND_URL` in Vercel points to Railway backend
2. Check CORS settings in backend
3. Ensure backend is deployed and running
4. Check Railway backend logs for errors

### Database Connection Issues
1. Use **internal URLs** (`postgres.railway.internal`) not public URLs
2. Verify database is running in Railway dashboard
3. Check DATABASE_URL format is correct
4. Run migrations: `pnpm run prisma-db-push`

### PM2 Issues
If PM2 fails to start:
1. Check Railway logs
2. Try using individual start commands instead:
   ```bash
   pnpm run start:prod:backend & pnpm run start:prod:workers & pnpm run start:prod:cron
   ```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USERS                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │                            │
    ▼                            ▼
┌─────────────────┐    ┌──────────────────┐
│  Vercel         │    │  Railway         │
│  (Frontend)     │───▶│  (Backend)       │
│  Next.js App    │    │  NestJS API      │
└─────────────────┘    │  Workers         │
                       │  Cron Jobs       │
                       └────────┬─────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌───────────────┐      ┌──────────────┐
            │  PostgreSQL   │      │    Redis     │
            │  (Railway)    │      │  (Railway)   │
            └───────────────┘      └──────────────┘
```

---

## Need Help?

- Check Railway logs for backend issues
- Check Vercel deployment logs for frontend issues
- Verify all environment variables are correctly set
- Ensure React version hasn't changed (18.3.1)
- Reference: `claude.md` for quick config reference

---

## Quick Reference Files

- **claude.md** - Database URLs and quick reference
- **.env.railway** - Railway environment variables template
- **vercel.json** - Vercel configuration
- **railway.toml** - Railway deployment config
- **.env.example** - All available environment variables
