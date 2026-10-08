# CampusOS — Production Deployment Guide

CampusOS is prepared for production with:
- **Frontend**: Hosted on [Vercel](https://vercel.com) (Next.js App Router)
- **Backend**: Hosted on [Render](https://render.com) (Node.js / Express Web Service)
- **Database**: Hosted on [Neon](https://neon.tech) (Serverless PostgreSQL with SSL)

---

## 1. Backend Deployment (Render)

### Option A: Automatic via Render Blueprint (Recommended)
1. Push your repository to GitHub / GitLab.
2. In the Render Dashboard, click **New +** → **Blueprint**.
3. Select your repository. Render will automatically detect [`render.yaml`](./render.yaml).
4. Enter the required environment variable values prompted by Render:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string (`postgresql://...@...neon.tech/neondb?sslmode=require`)
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://campusos.vercel.app`)

### Option B: Manual Web Service
1. In Render, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Name**: `campusos-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `DATABASE_URL` | *Your Neon connection string with `?sslmode=require`* |
   | `FRONTEND_URL` | `https://<your-app>.vercel.app` |
   | `COOKIE_SECRET` | *A strong random secret string* |
   | `SESSION_MAX_AGE_DAYS` | `7` |
   | `CLOUDINARY_CLOUD_NAME` | *(Optional) Cloudinary cloud name* |
   | `CLOUDINARY_API_KEY` | *(Optional) Cloudinary API key* |
   | `CLOUDINARY_API_SECRET` | *(Optional) Cloudinary API secret* |

Once deployed, note your Render backend URL (e.g. `https://campusos-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Import your Git repository.
3. In **Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click "Edit" and set to `frontend`
4. In **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-render-backend-url>.onrender.com/api/v1` |
5. Click **Deploy**.

---

## 3. Post-Deployment Verification Checklist

1. **CORS & Authentication**:
   - Log in using a student or admin credential.
   - Verify the HttpOnly session cookie is saved with `SameSite=None; Secure` in your browser.
2. **Health Check**:
   - Access `https://<your-backend>.onrender.com/health` → Should respond with `{"status":"ok", ...}`.
3. **Database Connectivity**:
   - Ensure event listings and academic vault posts load smoothly from Neon.
