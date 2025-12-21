# Postiz Deployment Configuration

## Repository
- **GitHub Repository**: https://github.com/vtbalaji/postiz-app
- **Original Fork**: https://github.com/gitroomhq/postiz-app

## Database Configuration

### PostgreSQL
- **Public URL**: `postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@trolley.proxy.rlwy.net:55025/railway`
- **Local/Internal URL**: `postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@postgres.railway.internal:5432/railway`

### Redis
- **Public URL**: `redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@shuttle.proxy.rlwy.net:12395`
- **Local/Internal URL**: `redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@redis.railway.internal:6379`

## Deployment Platforms

### Railway Deployment
- Use for backend services
- Better for monorepo backend deployment
- Connect to: https://github.com/vtbalaji/postiz-app

### Vercel Deployment
- Use for frontend/Next.js apps
- Connect to: https://github.com/vtbalaji/postiz-app

## Environment Variables

### Required for Railway Backend:
```bash
DATABASE_URL=postgresql://postgres:nBrAOfoTkCuwuiZqOnrfwaqcNzkVyFex@postgres.railway.internal:5432/railway
REDIS_URL=redis://default:NKTXsGSYysVrgiZKJIvpIWtvdRWpbHHA@redis.railway.internal:6379
```

### Required for Vercel Frontend:
```bash
NEXT_PUBLIC_BACKEND_URL=<your-railway-backend-url>
```

## Important Notes

### React Version
**⚠️ CRITICAL: DO NOT CHANGE REACT VERSION**
- Changing React version leads to dependency failures
- Keep current React version as-is in package.json
- Do not run `npm update react` or similar commands

### Deployment Architecture Options

#### Option 1: Full Stack on Railway
- Deploy entire monorepo to Railway
- Single deployment for both frontend and backend
- Use internal URLs for database and Redis

#### Option 2: Split Deployment (Recommended)
- **Railway**: Backend services only
  - Use internal URLs (postgres.railway.internal, redis.railway.internal)
  - Better performance and cost
- **Vercel**: Frontend Next.js app
  - Point to Railway backend via public URL
  - Better CDN and edge performance

## Backup Location
- **Backup File**: `/Users/balajithanigaiarasu/postiz/backups/postiz-app-old-backup-20251221.zip`
- **Backup Size**: 52 MB
- **Backup Date**: December 21, 2025

## Deployment Files

### Configuration Files Created
- **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment guide
- **.env.railway** - Railway environment variables template
- **vercel.json** - Vercel deployment configuration
- **railway.toml** - Railway build and deploy settings

### Quick Deploy

#### For Railway (Option 1: Full Stack)
```bash
# See DEPLOYMENT_GUIDE.md - Option 1
# Deploy entire app to Railway
# Use railway.toml configuration
```

#### For Railway + Vercel (Option 2: Split - Recommended)
```bash
# See DEPLOYMENT_GUIDE.md - Option 2
# Backend → Railway
# Frontend → Vercel
```

## Deployment Steps (Quick)

### Railway Setup
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository: https://github.com/vtbalaji/postiz-app
4. Add environment variables from `.env.railway`
5. Use **internal URLs** for DATABASE_URL and REDIS_URL
6. Deploy

### Vercel Setup
1. Go to https://vercel.com
2. Import project from GitHub: https://github.com/vtbalaji/postiz-app
3. Set Root Directory: `apps/frontend`
4. Add `NEXT_PUBLIC_BACKEND_URL` pointing to Railway backend
5. Deploy

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Make sure to use internal URLs in Railway
   - Use: `postgres.railway.internal:5432`
   - NOT: `trolley.proxy.rlwy.net:55025`
2. **Build Failures**: Check React version hasn't changed (must stay at 18.3.1)
3. **Port Issues**: Ensure PORT environment variable is set to 3000
4. **PM2 Failures**: Check Railway logs, may need to adjust start command

### Logs & Debugging
- **Railway**: Dashboard → Service → Deployments → View Logs
- **Vercel**: Dashboard → Project → Deployments → Function Logs

### Detailed Troubleshooting
See **DEPLOYMENT_GUIDE.md** for comprehensive troubleshooting guide
