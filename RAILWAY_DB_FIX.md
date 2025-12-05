# Fix: Railway Database Connection During Deployment

## 🔴 The Problem

Your build is failing because:

```
Build phase tries to run: pnpm run build
  ↓
Build needs Prisma client generated
  ↓
Prisma generation fails (database not available yet)
  ↓
Build fails ❌
```

**Why?** Railway's build phase runs BEFORE the database is connected.

---

## ✅ The Solution

**Don't require DATABASE_URL during build.** Separate these:

1. **Build Phase** (no database needed)
   - Generate Prisma client
   - Compile TypeScript
   - Bundle code

2. **Start Phase** (database available)
   - Run migrations
   - Start service

---

## 🔧 Fix Your Backend Build Script

### Step 1: Update `apps/backend/package.json`

Change your build script to NOT require DATABASE_URL:

**OLD (fails on Railway):**
```json
{
  "scripts": {
    "build": "pnpm run prisma:generate && cross-env NODE_ENV=production nest build",
    "prisma:generate": "pnpm dlx prisma@6.5.0 generate --schema ../../libraries/nestjs-libraries/src/database/prisma/schema.prisma"
  }
}
```

**NEW (works on Railway):**
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production nest build",
    "prisma:generate": "pnpm dlx prisma@6.5.0 generate --schema ../../libraries/nestjs-libraries/src/database/prisma/schema.prisma",
    "postinstall": "pnpm run prisma:generate"
  }
}
```

### What Changed?

- ❌ Removed `pnpm run prisma:generate` from build
- ✅ Added `postinstall` script (runs after `pnpm install`)
- ✅ Build no longer needs database
- ✅ Prisma generates during install phase (before build)

---

## 📝 Update Your Railway Configuration

### For Railway, set build command to:

```bash
pnpm install --frozen-lockfile && pnpm run build:backend
```

**NOT:**
```bash
pnpm install --frozen-lockfile && pnpm run prisma:generate && pnpm run build:backend
```

The `postinstall` script will handle Prisma generation automatically! ✅

---

## 🔄 Complete Fixed Setup

### `apps/backend/package.json`

```json
{
  "name": "postiz-backend",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "dev": "dotenv -e ../../.env -- nest start --watch --entryFile=./apps/backend/src/main",
    "build": "cross-env NODE_ENV=production nest build",
    "prisma:generate": "pnpm dlx prisma@6.5.0 generate --schema ../../libraries/nestjs-libraries/src/database/prisma/schema.prisma",
    "postinstall": "pnpm run prisma:generate",
    "start": "node --experimental-require-module ./dist/apps/backend/src/main.js",
    "pm2": "pm2 start pnpm --name backend -- start"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

**Key changes:**
1. ✅ `build` script: Remove prisma:generate (no DB needed)
2. ✅ `postinstall`: Added (runs after npm install, before build)
3. ✅ `prisma:generate`: Kept (called by postinstall)

---

## 🚀 Railway Deployment Flow (Fixed)

### Build Phase:
```
1. Clone repo
2. pnpm install --frozen-lockfile
   ↓ Triggers postinstall hook
   ↓ Runs: pnpm run prisma:generate
   ↓ NO DATABASE NEEDED ✅
   ↓ Prisma client generated
3. pnpm run build:backend
   ↓ Compiles TypeScript
   ↓ No database needed ✅
4. Build complete ✅
```

### Start Phase:
```
1. Database available ✅
2. Export DATABASE_URL
3. node ./dist/apps/backend/src/main.js
   ↓ Service starts
   ↓ Connects to database ✅
4. Service running ✅
```

---

## 📋 Step-by-Step: Deploy to Railway Again

### 1. Update Your Code

Replace your `apps/backend/package.json` with the fixed version above.

### 2. Commit Changes

```bash
git add apps/backend/package.json
git commit -m "Fix Railway deployment: Move prisma:generate to postinstall

- Remove prisma generation from build (doesn't need DATABASE_URL)
- Add postinstall script (runs after pnpm install)
- Build phase no longer requires database connection
- Fixes Railway deployment issue"
git push origin main
```

### 3. Railway Deployment Settings

Go to Railway dashboard for your backend:

1. **Build Command:**
   ```
   pnpm install --frozen-lockfile && pnpm run build:backend
   ```

2. **Start Command:**
   ```
   pnpm run --filter ./apps/backend start
   ```

3. **Environment Variables:**
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=512
   DATABASE_URL=postgresql://... (from your Vercel PostgreSQL)
   REDIS_URL=(if using Redis)
   FRONTEND_URL=https://your-frontend.vercel.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-railway.app
   BACKEND_INTERNAL_URL=http://localhost:3000
   JWT_SECRET=your-random-32-char-string
   STORAGE_PROVIDER=local
   ```

4. **Click Deploy**

---

## 🎯 Why This Works

### Before (Failed):
```
Install → Build (needs DB) ❌ → Start

Database not ready during build = FAILURE
```

### After (Works):
```
Install (generate Prisma) → Build → Start (DB ready) ✅

Prisma generation happens during install (no DB needed)
Build just compiles code (no DB needed)
Start runs with DATABASE_URL available
```

---

## ✅ Deployment Phases Explained

### Phase 1: Install (No DB needed)
```bash
pnpm install --frozen-lockfile
```

**This triggers:**
- Downloads dependencies
- Runs `postinstall` hook
- `postinstall` runs: `pnpm run prisma:generate`
- **✅ No database needed** (Prisma just generates types)

### Phase 2: Build (No DB needed)
```bash
pnpm run build:backend
```

**This:**
- Compiles TypeScript → JavaScript
- Creates `dist/` folder
- **✅ No database needed** (just TypeScript compilation)

### Phase 3: Start (DB needed)
```bash
node ./dist/apps/backend/src/main.js
```

**This:**
- Starts NestJS service
- Connects to DATABASE_URL
- Service is running ✅

---

## 🔍 Why Prisma Generation Doesn't Need Database

```typescript
// Prisma Client Generation

What it does:
1. Reads your prisma/schema.prisma
2. Generates TypeScript types from schema
3. Creates node_modules/@prisma/client

What it doesn't do:
❌ Connect to database
❌ Run migrations
❌ Validate schema on database

Why? It just generates code from schema file!
```

**Example:**
```prisma
// schema.prisma
model User {
  id Int @id
  email String
}
```

**Generates:**
```typescript
// @prisma/client
export interface User {
  id: number;
  email: string;
}
```

**No database needed!** ✅

---

## 🆘 If It Still Fails

### Error: "Database URL not set"

**Solution:** Make sure `DATABASE_URL` is in Railway environment variables.

**Check:**
1. Go to Railway dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Verify `DATABASE_URL` is set

### Error: "Prisma client not found"

**Solution:** Verify postinstall script ran.

**Check:**
1. Go to Railway deployments
2. Click on the failed build
3. Look at build logs
4. Search for "postinstall"
5. Should see: `> postiz-backend@1.0.0 postinstall`

### Error: Build timeout

**Solution:** Increase timeout or optimize build.

**In Railway:**
1. Service settings
2. Increase build timeout to 900 seconds

---

## 📊 Before vs After

| Step | Before | After |
|------|--------|-------|
| Install | pnpm install | pnpm install + postinstall ✅ |
| Build | pnpm build (needs DB) ❌ | pnpm build (no DB) ✅ |
| Start | Tries to start | Starts with DB ✅ |
| Result | FAILS | SUCCESS ✅ |

---

## 🎯 Summary

**The Fix:**

1. Move `prisma:generate` from `build` to `postinstall`
2. Update `apps/backend/package.json`
3. Commit and push
4. Railway auto-redeploys
5. Build succeeds ✅

**Why it works:**

- Install phase: Generates Prisma (no DB needed)
- Build phase: Compiles code (no DB needed)
- Start phase: Service runs (DB available)

**Time to fix:** 5 minutes

---

## 📝 Copy-Paste Solution

Just replace your `apps/backend/package.json` with this:

```json
{
  "name": "postiz-backend",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "dev": "dotenv -e ../../.env -- nest start --watch --entryFile=./apps/backend/src/main",
    "build": "cross-env NODE_ENV=production nest build",
    "prisma:generate": "pnpm dlx prisma@6.5.0 generate --schema ../../libraries/nestjs-libraries/src/database/prisma/schema.prisma",
    "postinstall": "pnpm run prisma:generate",
    "start": "node --experimental-require-module ./dist/apps/backend/src/main.js",
    "pm2": "pm2 start pnpm --name backend -- start"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Then:

```bash
git add apps/backend/package.json
git commit -m "Fix Railway deployment: move prisma to postinstall"
git push
```

Railway will auto-redeploy and it should work! 🚀

---

**Ready to try this fix?**
