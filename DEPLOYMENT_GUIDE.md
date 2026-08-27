# CivicConnect — Complete Vercel Deployment Guide

This guide will walk you through deploying the full-stack **CivicConnect** platform (React frontend + Express & Prisma backend) to **Vercel**.

---

## 📋 Table of Contents
1. [Overview & Recommended Strategy](#-overview--recommended-strategy)
2. [Step 1: Create Free PostgreSQL Database (Neon)](#step-1-create-free-postgresql-database-neon)
3. [Step 2: Setup Database Schema & Seed Data](#step-2-setup-database-schema--seed-data)
4. [Step 3: Setup Cloudinary (for Photo Uploads)](#step-3-setup-cloudinary-for-photo-uploads)
5. [Step 4: Deploy to Vercel (Option 1: Unified Monorepo - Recommended)](#step-4-deploy-to-vercel-option-1-unified-monorepo---recommended)
6. [Alternative: Option 2 (Separate Backend & Frontend Projects)](#alternative-option-2-separate-backend--frontend-projects)
7. [Environment Variables Reference](#-environment-variables-reference)
8. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Overview & Recommended Strategy

### Option 1: Unified Monorepo (Recommended — 1 Vercel Project)
- **Single URL:** e.g. `https://civicconnect.vercel.app`
- **Zero CORS Issues:** Frontend and Backend live on the same domain.
- **How it works:** Vercel serves the React SPA from `client/dist` and executes the Express backend via Serverless Functions at `/api/*`.

---

## Step 1: Create Free PostgreSQL Database (Neon)

Vercel functions are stateless and require a cloud database. We recommend **Neon** (serverless Postgres with generous free tier):

1. Go to [https://neon.tech](https://neon.tech) and sign up / sign in (with GitHub or Google).
2. Click **Create a Project**.
3. Name it `civicconnect` (choose region closest to you, e.g. AWS US East or Asia Pacific).
4. Click **Create Project**.
5. Neon will display your **Connection Details**.
6. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-cool-fog-123456.us-east-1.aws.neon.tech/civicconnect?sslmode=require
   ```
   > 💡 Save this URL — you will use it as your `DATABASE_URL`.

---

## Step 2: Setup Database Schema & Seed Data

Before deploying, apply your Prisma schema and seed demo data into your Neon database from your local machine:

1. Open your terminal in the `server` directory:
   ```bash
   cd server
   ```

2. Temporarily set your `DATABASE_URL` in `server/.env` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-cool-fog-123456.us-east-1.aws.neon.tech/civicconnect?sslmode=require"
   ```

3. Push the Prisma schema to your cloud database:
   ```bash
   npx prisma db push
   ```

4. Seed initial problems, categories, solutions, and demo users:
   ```bash
   npm run seed
   ```
   *(This creates Admin, Citizen, and Organization test accounts with pre-populated community issues)*

---

## Step 3: Setup Cloudinary (for Photo Uploads)

Since serverless functions cannot store files permanently on local disk, Cloudinary is used for problem and solution images:

1. Sign up for free at [https://cloudinary.com](https://cloudinary.com).
2. Go to the **Dashboard** / **API Keys** section.
3. Note your:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

---

## Step 4: Deploy to Vercel (Option 1: Unified Monorepo - Recommended)

### Method A: Via Vercel Dashboard (Easiest)

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and serverless optimizations"
   git push origin main
   ```

2. Open [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.

3. **Import** your `civicconnect` GitHub repository.

4. In the **Configure Project** screen:
   - **Project Name**: `civicconnect` (or any custom name)
   - **Framework Preset**: Leave as **Other** (or Vite)
   - **Root Directory**: `./` (leave default, do not change)
   - The root [`vercel.json`](file:///c:/Users/Reshm/Documents/civicconnect/vercel.json) will automatically handle the build and routes.

5. Expand the **Environment Variables** section and add:

   | Variable Key | Value Example | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://...neon.tech/civicconnect?sslmode=require` | Your Neon PostgreSQL connection string |
   | `JWT_SECRET` | `your_super_secret_jwt_key_here_32_chars` | Secret key for JWT authentication |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API Secret |
   | `NODE_ENV` | `production` | Environment mode |

6. Click **Deploy** 🚀

7. Once deployed:
   - Visit `https://your-project.vercel.app/` — your React frontend will load.
   - Visit `https://your-project.vercel.app/api/health` — will return `{ success: true, message: "CivicConnect API is running." }`.

---

### Method B: Via Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. From the root `civicconnect` directory, run:
   ```bash
   vercel
   ```

3. Follow the CLI prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **No**
   - What's your project's name? **civicconnect**
   - In which directory is your code located? **`./`**

4. Add your environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   vercel env add NODE_ENV
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Alternative: Option 2 (Separate Backend & Frontend Projects)

If you prefer two separate Vercel projects:

### 1. Deploy the Backend Project
- **Import Repo** → Set **Root Directory** to `server`.
- **Framework Preset**: Other
- Add Environment Variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CLOUDINARY_*`
  - `CLIENT_URL` (set to your frontend's Vercel URL once deployed)
- Deploy → note the backend URL (e.g. `https://civicconnect-api.vercel.app`).

### 2. Deploy the Frontend Project
- **Import Repo** (same repo) → Set **Root Directory** to `client`.
- **Framework Preset**: Vite
- Add Environment Variable:
  - `VITE_API_URL`: `https://civicconnect-api.vercel.app/api`
- Deploy → visit frontend URL!

---

## 🔑 Environment Variables Reference

| Variable | Required? | Location | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | Server / Root | PostgreSQL connection string (Neon/Supabase) |
| `JWT_SECRET` | **Yes** | Server / Root | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | No | Server / Root | Default: `7d` |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Server / Root | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | **Yes** | Server / Root | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes** | Server / Root | Cloudinary API secret |
| `CLIENT_URL` | No | Server / Root | Optional custom CORS origin |
| `NODE_ENV` | No | Server / Root | Set to `production` |
| `VITE_API_URL` | Only for Option 2 | Client | Full URL to API endpoint with `/api` suffix |

---

## 🎭 Demo Login Accounts

After seeding the database (`npm run seed`), test the platform using:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@civicconnect.com` | `Admin@123` |
| **Citizen (User)** | `arjun@example.com` | `User@123` |
| **Organization** | `puda@example.com` | `User@123` |

---

## 🛠 Troubleshooting & FAQs

### Q: Why do I get a database connection error on Vercel?
**A:** Ensure your `DATABASE_URL` environment variable is set in the Vercel project settings and includes `?sslmode=require`. If using Neon, ensure you use the direct or pooled connection string.

### Q: Why do images fail to upload on Vercel?
**A:** Vercel functions cannot save files to local `/uploads` directory. Make sure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are added in your Vercel project Environment Variables.

### Q: How do I re-run migrations on production?
**A:** From your local machine with `DATABASE_URL` pointing to your Neon database:
```bash
cd server
npx prisma db push
```
