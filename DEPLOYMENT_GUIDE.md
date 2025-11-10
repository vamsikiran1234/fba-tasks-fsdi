# 🚀 Deployment Guide - Full Stack Developer Internship

**Complete step-by-step deployment instructions for production**

---

## 📋 Prerequisites

Before starting deployment, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (free tier)
- ✅ PostgreSQL database (Railway/Supabase/Neon free tier)
- ✅ Render/Railway/Fly.io account for Vanna AI (free tier available)
- ✅ Groq API key (free tier: https://console.groq.com)

---

## 🗂️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User Browser                                               │
│      │                                                      │
│      ↓                                                      │
│  ┌──────────────────────────────────────────────┐          │
│  │  Frontend + Backend API (Vercel)             │          │
│  │  • Next.js App Router                        │          │
│  │  • API Routes (/api/*)                       │          │
│  │  URL: https://yourapp.vercel.app             │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                       │
│                     ├──────────────┐                       │
│                     ↓              ↓                       │
│  ┌─────────────────────────┐  ┌────────────────────────┐  │
│  │  PostgreSQL Database    │  │  Vanna AI Service      │  │
│  │  (Railway/Supabase)     │  │  (Render/Railway)      │  │
│  │  • Stores invoice data  │  │  • SQL generation      │  │
│  │  • Accessed by Prisma   │  │  • Groq LLM            │  │
│  └─────────────────────────┘  └────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 STEP 1: Prepare Your Code

### 1.1 Clean Up Unnecessary Files

```powershell
cd c:\Users\vamsi\Documents\fba-tasks-fsdi
.\cleanup.ps1
```

### 1.2 Verify Project Structure

```
fba-tasks-fsdi/
├── README.md
├── QUICK_START.md
├── API_DOCUMENTATION.md
├── DEPLOYMENT.md (this file)
├── package.json
├── turbo.json
├── docker-compose.yml
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Backend + Prisma
├── services/
│   └── vanna/            # Vanna AI service
├── data/
│   └── Analytics_Test_Data.json
└── prisma/
    └── migrations/
```

### 1.3 Create `.gitignore` (if not exists)

```bash
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Environment
.env
.env*.local
.env.production

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
*.egg-info/

# Prisma
prisma/dev.db
prisma/dev.db-journal
```

### 1.4 Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "feat: Complete full-stack analytics dashboard with AI chat"

# Create repository on GitHub (make it PUBLIC or get shareable link)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 🗄️ STEP 2: Deploy PostgreSQL Database

### Option A: Railway (Recommended - Free Tier)

1. **Sign up at Railway.app**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for database to provision (~30 seconds)

3. **Get Connection String**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy the "Postgres Connection URL"
   - Format: `postgresql://user:password@host:port/database`

4. **Save Connection String**
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:7432/railway
   ```

### Option B: Supabase (Free Tier)

1. **Sign up at Supabase.com**
   - Go to https://supabase.com
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose organization
   - Enter project name, database password
   - Select region (closest to you)
   - Click "Create Project"

3. **Get Connection String**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Choose "URI" format
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password

4. **Save Connection String**
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### Option C: Neon (Free Tier)

1. **Sign up at Neon.tech**
   - Go to https://neon.tech
   - Sign up with GitHub

2. **Create Project**
   - Click "Create Project"
   - Enter project name
   - Select region
   - Click "Create Project"

3. **Get Connection String**
   - Copy the connection string shown
   - Format: `postgresql://user:password@host/database`

---

## 🌐 STEP 3: Deploy Frontend + Backend to Vercel

### 3.1 Install Vercel CLI (Optional)

```powershell
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended)

1. **Sign up at Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository you pushed

3. **Configure Project**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** Leave default or use: `npm run build`
   - **Output Directory:** Leave default (`.next`)
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database

   # API Base (will be same as your Vercel URL)
   NEXT_PUBLIC_API_BASE=/api
   
   # Vanna AI (add after deploying Vanna in Step 4)
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   
   # Groq API Key
   GROQ_API_KEY=your_groq_api_key_here
   ```

   **How to get Groq API Key:**
   - Go to https://console.groq.com
   - Sign up/Login
   - Go to API Keys section
   - Create new API key
   - Copy and save it

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)
   - You'll get a URL like: `https://your-project.vercel.app`

### 3.3 Run Database Migrations

After first deployment, you need to set up the database:

**Option A: Using Vercel CLI**
```powershell
# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Using Railway/Render Console**

1. Go to your Railway/Supabase dashboard
2. Open SQL Editor
3. Run the migration SQL from `prisma/migrations/20251109142131_init/migration.sql`

**Option C: Using Prisma Studio (Local)**

```powershell
# Pull production env vars locally
cd apps/api

# Set DATABASE_URL in .env file
# DATABASE_URL="postgresql://user:password@host:port/database"

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Verify data
npx prisma studio
```

---

## 🤖 STEP 4: Deploy Vanna AI Service

### Option A: Render (Recommended)

1. **Sign up at Render.com**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Select your repository

3. **Configure Service**
   - **Name:** `your-project-vanna-ai`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `services/vanna`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

4. **Add Environment Variables**
   ```bash
   DATABASE_URL=postgresql+psycopg://user:password@host:port/database
   GROQ_API_KEY=your_groq_api_key_here
   PORT=8000
   PYTHONUNBUFFERED=1
   ```

   **Note:** For Vanna, use `postgresql+psycopg://` prefix instead of `postgresql://`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5-10 minutes first time)
   - You'll get URL like: `https://your-project-vanna-ai.onrender.com`

6. **Test Vanna Service**
   ```bash
   curl https://your-project-vanna-ai.onrender.com/health
   # Should return: {"status":"healthy"}
   ```

### Option B: Railway

1. **Create New Project**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**
   - Root Directory: `services/vanna`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables** (same as above)

4. **Deploy and Generate Domain**
   - Click "Settings" → "Generate Domain"
   - You'll get URL like: `https://your-service.up.railway.app`

### Option C: Fly.io

1. **Install Fly CLI**
   ```powershell
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Create fly.toml** in `services/vanna/`:
   ```toml
   app = "your-vanna-service"
   primary_region = "lax"

   [build]
   dockerfile = "Dockerfile"

   [env]
   PORT = "8000"
   PYTHONUNBUFFERED = "1"

   [[services]]
   internal_port = 8000
   protocol = "tcp"

   [[services.ports]]
   handlers = ["http"]
   port = 80

   [[services.ports]]
   handlers = ["tls", "http"]
   port = 443
   ```

3. **Deploy**
   ```powershell
   cd services/vanna
   fly auth login
   fly launch
   fly secrets set DATABASE_URL="postgresql+psycopg://..."
   fly secrets set GROQ_API_KEY="..."
   fly deploy
   ```

---

## 🔗 STEP 5: Connect Everything Together

### 5.1 Update Vercel Environment Variables

Go back to Vercel Dashboard:

1. Navigate to your project
2. Go to Settings → Environment Variables
3. Add/Update:
   ```bash
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   ```
4. **Redeploy** the project (Settings → Deployments → click "..." → Redeploy)

### 5.2 Configure CORS in Vanna Service

Update `services/vanna/app.py` if needed:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-project.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then redeploy Vanna service.

---

## ✅ STEP 6: Verify Deployment

### 6.1 Test Frontend

1. Open your Vercel URL: `https://your-project.vercel.app`
2. Verify:
   - ✅ Dashboard loads
   - ✅ All 4 overview cards show data
   - ✅ Charts render with data
   - ✅ Invoices table shows entries
   - ✅ No console errors (F12 → Console)

### 6.2 Test API Endpoints

```bash
# Test stats endpoint
curl https://your-project.vercel.app/api/stats

# Test invoice trends
curl https://your-project.vercel.app/api/invoice-trends

# Test vendors
curl https://your-project.vercel.app/api/vendors/top10
```

### 6.3 Test Chat with Data

1. Navigate to "Chat with Data" tab
2. Type query: "What is the total spend in the last 365 days?"
3. Verify:
   - ✅ SQL is generated
   - ✅ Results are displayed
   - ✅ Data is accurate

### 6.4 Test Export Functionality

1. Click "Export Analytics" button
2. Verify CSV downloads
3. Test other export buttons

---

## 🐛 Troubleshooting

### Issue: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Check DATABASE_URL format is correct
2. Ensure database is running
3. Verify firewall allows connections
4. For Supabase: Enable "Pooler" mode
5. For Railway: Check if database is active

### Issue: Vanna AI Not Responding

**Error:** `Failed to fetch` or CORS error

**Solution:**
1. Check VANNA_API_BASE_URL is correct
2. Verify Vanna service is running: `curl https://your-vanna.onrender.com/health`
3. Check CORS configuration allows Vercel domain
4. Check Vanna logs for errors

### Issue: Charts Not Displaying

**Error:** Charts are empty

**Solution:**
1. Check browser console for API errors
2. Verify database has seeded data: Use Prisma Studio
3. Check API endpoints return data: `curl https://your-app.vercel.app/api/stats`
4. Verify environment variables are set in Vercel

### Issue: Prisma Migration Fails

**Error:** `Migration failed`

**Solution:**
```powershell
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually run migrations
npx prisma migrate deploy
npx prisma db seed
```

### Issue: Build Fails on Vercel

**Error:** `Build failed`

**Solution:**
1. Check if all dependencies are in package.json
2. Verify root directory is set to `apps/web`
3. Check build logs for specific errors
4. Ensure Turborepo is configured correctly

---

## 📊 Deployment Checklist

Before submitting, verify:

### Frontend (Vercel)
- [ ] Deployed successfully
- [ ] No build errors
- [ ] All pages load
- [ ] Charts display data
- [ ] Export buttons work
- [ ] Search functionality works
- [ ] Responsive on mobile

### Backend API (Vercel)
- [ ] All endpoints accessible
- [ ] /api/stats returns data
- [ ] /api/invoice-trends works
- [ ] /api/vendors/top10 works
- [ ] /api/category-spend works
- [ ] /api/cash-outflow works
- [ ] /api/invoices works
- [ ] /api/chat-with-data works

### Database (Railway/Supabase)
- [ ] Database is running
- [ ] Tables created (Invoice, Vendor, Category)
- [ ] Data seeded (50 invoices)
- [ ] Connections working
- [ ] Migrations applied

### Vanna AI (Render/Railway)
- [ ] Service deployed
- [ ] Health check responds
- [ ] Connects to database
- [ ] Groq API key configured
- [ ] CORS allows Vercel domain
- [ ] Chat queries work

### Environment Variables
- [ ] DATABASE_URL set in Vercel
- [ ] VANNA_API_BASE_URL set in Vercel
- [ ] GROQ_API_KEY set in Vercel
- [ ] DATABASE_URL set in Vanna service
- [ ] GROQ_API_KEY set in Vanna service

---

## 🔒 Security Checklist

- [ ] All API keys stored in environment variables (not in code)
- [ ] Database credentials not exposed in frontend
- [ ] CORS configured properly (not allowing all origins in production)
- [ ] PostgreSQL has strong password
- [ ] .env files in .gitignore
- [ ] No sensitive data in git history

---

## 📝 Final URLs to Submit

After deployment, you'll have these URLs:

```
Frontend + Backend: https://your-project.vercel.app
Vanna AI Service:   https://your-vanna.onrender.com
GitHub Repository:  https://github.com/YOUR_USERNAME/YOUR_REPO
Demo Video:         [YouTube/Drive Link]
```

**Keep these URLs ready for submission email!**

---

## 🚀 Post-Deployment

### Monitor Your Services

1. **Vercel Dashboard**
   - Check deployment logs
   - Monitor analytics
   - View build logs

2. **Render/Railway Dashboard**
   - Check Vanna service logs
   - Monitor uptime
   - View resource usage

3. **Database Dashboard**
   - Monitor connections
   - Check storage usage
   - View query performance

### Free Tier Limits

Be aware of free tier limitations:

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless function execution: 100 GB-hours

**Render:**
- 750 hours/month (free)
- Service spins down after 15 min inactivity
- Cold start takes ~30 seconds

**Railway:**
- $5 free credit/month
- Charged per resource usage

**Supabase:**
- 500 MB database storage
- 2 GB bandwidth
- 50,000 monthly active users

---

## 🎯 Success Metrics

Your deployment is successful when:

✅ All URLs are accessible  
✅ Dashboard shows real data  
✅ Chat generates valid SQL  
✅ Export functionality works  
✅ No console errors  
✅ Mobile responsive  
✅ Loading time < 3 seconds  

---

## 📧 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Render/Railway service logs
4. Verify environment variables
5. Test API endpoints individually

---

## ✨ You're Ready!

Once all steps are completed, you have:

- ✅ Production-ready full-stack application
- ✅ All services deployed and connected
- ✅ Database populated with real data
- ✅ AI chat functionality working
- ✅ Professional deployment setup

**Your application is ready for submission!** 🎉

---

**Next:** Create your demo video and submit to recruit@flowbitai.com

