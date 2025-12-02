# Postiz Deployment Guide: Render.com

## Overview

This guide walks you through deploying Postiz on Render.com - an ideal platform for SaaS monetization with predictable costs and easy scaling.

## Why Render.com?

✅ **For Monetization:**
- Predictable pay-as-you-go pricing
- Free tier to launch without cost
- Scales with your user growth
- No complex Docker/K8s needed
- Easy environment management

✅ **For Your Monorepo:**
- Native pnpm workspace support
- Multiple services (backend, frontend, cron, workers)
- Managed PostgreSQL & Redis
- Built-in auto-deploy from Git

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Users/Clients                     │
└────────────┬────────────────────────────────┬────────┘
             │                                │
      (Port 4200)                      (Port 3000)
             │                                │
    ┌────────▼───────┐            ┌──────────▼──────┐
    │  Frontend Next  │            │   Backend API   │
    │  (Static + SSR) │            │   (NestJS)      │
    └────────┬────────┘            └────────┬────────┘
             │                               │
             └───────────────┬───────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Redis       │
                    │    Cache/Queue  │
                    └─────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  Cron Service        │  │  Workers Service     │
│  (Scheduled Tasks)   │  │  (Background Jobs)   │
└──────────────────────┘  └──────────────────────┘
       (Runs every 5min)        (Always running)
```

---

## Step 1: Prepare Your Repository

### 1.1 Update Node Version Compatibility

Your project requires Node 22.12+. Render supports this, but let's be explicit:

**In `package.json` root:**
```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=10.0.0"
  }
}
```

This allows more flexibility while still being modern.

### 1.2 Verify Prisma Configuration

Ensure Prisma client is properly configured for build-time generation:

**Check `pnpm-workspace.yaml`:**
```yaml
packages:
  - 'apps/*'
  - 'libraries/*'
```

### 1.3 Environment Variables

Create a `.env.render` file (DO NOT commit this):
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/postiz_db

# Redis
REDIS_URL=redis://user:password@host:6379

# Frontend URLs
FRONTEND_URL=https://your-postiz.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-api.onrender.com
BACKEND_INTERNAL_URL=http://postiz-backend:3000

# Security
JWT_SECRET=your-very-long-random-secret-key-min-32-chars

# Storage (Cloudflare R2)
STORAGE_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKETNAME=...
CLOUDFLARE_BUCKET_URL=...

# Social Media APIs (add your keys)
X_API_KEY=...
X_API_SECRET=...
LINKEDIN_CLIENT_ID=...
# ... etc
```

---

## Step 2: Deploy on Render.com

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for auto-deploy)
3. Connect your GitHub repository

### 2.2 Create Services (Option A: Via Dashboard)

**Create PostgreSQL Database:**
1. Dashboard → New → PostgreSQL
2. Name: `postiz-postgres`
3. Plan: Starter ($7/month) or Free (limited)
4. Region: Same as your services
5. Save connection string

**Create Redis Cache:**
1. Dashboard → New → Redis
2. Name: `postiz-redis`
3. Plan: Starter ($7/month) or Free (limited)
4. Region: Same as databases
5. Save connection string

**Create Backend Web Service:**
1. Dashboard → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - Name: `postiz-backend`
   - Root Directory: (leave empty for monorepo root)
   - Runtime: Node
   - Build Command: `pnpm install --frozen-lockfile && pnpm run build:backend`
   - Start Command: `pnpm run --filter ./apps/backend start`
   - Plan: Starter ($7/month)
   - Add environment variables (see section 2.4)
4. Deploy

**Create Frontend Web Service:**
1. Dashboard → New → Web Service
2. Same repo, same settings but:
   - Name: `postiz-frontend`
   - Build Command: `pnpm install --frozen-lockfile && pnpm run build:frontend`
   - Start Command: `pnpm run --filter ./apps/frontend start`
   - Port: 4200

**Create Cron Jobs:**
1. Dashboard → New → Cron Job
2. Name: `postiz-cron`
3. Build Command: `pnpm install --frozen-lockfile && pnpm run build:cron`
4. Start Command: `pnpm run --filter ./apps/cron start`
5. Schedule: `*/5 * * * *` (every 5 minutes)

**Create Workers Service:**
1. Dashboard → New → Web Service
2. Same as backend but:
   - Name: `postiz-workers`
   - Build Command: `pnpm install --frozen-lockfile && pnpm run build:workers`
   - Start Command: `pnpm run --filter ./apps/workers start`

### 2.3 Create Services (Option B: Via render.yaml)

**If Render supports YAML config (check their docs):**

```bash
# Push render.yaml to your repo
git add render.yaml
git commit -m "Add Render deployment config"
git push

# Then in Render dashboard:
# Dashboard → New → Blueprint
# Connect repo → it auto-reads render.yaml
```

### 2.4 Environment Variables Configuration

For each service, add these environment variables in Render dashboard:

**Backend Service:**
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
DATABASE_URL=(auto-filled from PostgreSQL)
REDIS_URL=(auto-filled from Redis)
FRONTEND_URL=https://your-postiz.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-api.onrender.com
BACKEND_INTERNAL_URL=http://postiz-backend:3000
JWT_SECRET=(your secret)
CLOUDFLARE_ACCOUNT_ID=(your value)
CLOUDFLARE_ACCESS_KEY=(your value)
CLOUDFLARE_SECRET_ACCESS_KEY=(your value)
CLOUDFLARE_BUCKETNAME=(your value)
CLOUDFLARE_BUCKET_URL=(your value)
X_API_KEY=(optional)
X_API_SECRET=(optional)
LINKEDIN_CLIENT_ID=(optional)
LINKEDIN_CLIENT_SECRET=(optional)
# ... add all required APIs
```

**Frontend Service:**
```
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://your-api.onrender.com
FRONTEND_URL=https://your-postiz.onrender.com
```

**Cron & Workers Services:**
```
NODE_ENV=production
DATABASE_URL=(auto-filled from PostgreSQL)
REDIS_URL=(auto-filled from Redis)
```

---

## Step 3: Custom Domain Setup

### 3.1 Connect Your Domain

1. In Render dashboard, select your frontend service
2. Settings → Custom Domains
3. Add your domain: `postiz.yoursite.com`
4. Follow Render's instructions to add CNAME records to your DNS

### 3.2 Backend API Domain

Similarly, add a subdomain for backend: `api.yoursite.com`

---

## Step 4: Database Migrations

### 4.1 On First Deploy

After deployment, run migrations:

```bash
# SSH into backend service or use Render shell
pnpm run prisma-db-push
```

Or add to backend's start command:
```bash
pnpm run prisma-db-push && pnpm run --filter ./apps/backend start
```

### 4.2 Verify Database

Check your PostgreSQL database is populated with Prisma schema.

---

## Pricing Breakdown (As of 2025)

| Service | Plan | Cost/Month | Notes |
|---------|------|-----------|-------|
| PostgreSQL | Starter | $7 | 1GB RAM, 10GB storage |
| Redis | Starter | $7 | 256MB RAM |
| Backend API | Starter | $7 | 0.5GB RAM, 0.5 CPU |
| Frontend | Starter | $7 | 0.5GB RAM, 0.5 CPU |
| Workers | Starter | $7 | 0.5GB RAM, 0.5 CPU |
| Cron Job | Starter | $7 | Billed per execution |
| **Total** | | **~$42/month** | For small SaaS |

**Scaling for Monetization:**
- Free tier: ~$0 (limited)
- Startup: ~$50/month
- Growth: ~$100-300/month
- Enterprise: Custom pricing

---

## Step 5: Monitoring & Logs

### 5.1 Real-time Logs

Dashboard → Service → Logs tab to see live output.

### 5.2 Health Checks

Render auto-monitors services. Set health check endpoints:

**Backend Health Check:**
```
GET /health
```

**Frontend Health Check:**
```
GET /
```

### 5.3 Auto-scaling (for Paid Plans)

When you upgrade from Starter, enable auto-scaling:
- Min instances: 1
- Max instances: 3
- Scale by: CPU/Memory usage

---

## Step 6: CI/CD & Auto-Deploy

### 6.1 Automatic Deployments

Connect to GitHub:
1. Push to main branch
2. Render automatically rebuilds all services
3. Zero-downtime deployments

### 6.2 Rollback

If deployment fails:
1. Dashboard → Service → Deployments
2. Select previous deployment
3. Click "Deploy" to rollback

---

## Optimization Tips for Monetization

### 6.1 Reduce Costs

**For Development/Testing:**
- Use free tier databases initially
- Run cron less frequently (every 30min instead of 5min)
- Disable workers until needed

**For Production:**
- Use Starter plans ($7/service minimum)
- Enable Render's built-in caching
- Optimize database queries
- Use CDN for static assets (Cloudflare)

### 6.2 Performance

- Enable HTTP/2 (Render default)
- Use Render's built-in Redis for sessions
- Cache API responses aggressively
- Compress database backups

### 6.3 Security

- Use Render's auto-SSL/TLS
- Keep environment variables private
- Set database backups to daily
- Enable PostgreSQL encryption

---

## Troubleshooting

### Build Failures

```bash
# Check logs for specific errors
# Common issues:

# 1. Out of memory
# Solution: Add NODE_OPTIONS=--max-old-space-size=512

# 2. Prisma not generated
# Solution: Add prisma-generate to build command

# 3. pnpm lockfile issues
# Solution: Use --frozen-lockfile in build command
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is correct format:
postgresql://user:password@host:5432/database

# Check firewall/IP allowlist in PostgreSQL settings
# Render services auto-whitelisted (internal only)
```

### Slow Deployments

- **Cold starts**: First request after deploy takes longer (normal)
- **Solution**: Use health checks to warm up services
- **Alternative**: Upgrade to higher tier with more RAM

---

## Next Steps for Monetization

1. **Set up billing**: Stripe/Lemon Squeezy integration
2. **Track metrics**: Use Sentry for error tracking
3. **Monitor usage**: Implement analytics
4. **Plan scaling**: Know your cost per user
5. **Optimize database**: Regular indexing/optimization

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Postiz Docs**: http://docs.postiz.com
- **Contact Render Support**: support@render.com

---

**Last Updated**: December 2025
**Status**: Production Ready
