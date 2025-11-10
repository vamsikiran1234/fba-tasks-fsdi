# 🔑 Environment Variables - Quick Reference

**Your Neon Database Connection Strings**

---

## 📍 For Vercel (Frontend + Backend API)

```bash
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-broad-bush-a1wdclvl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Where to add:**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- Apply to: Production, Preview, Development (all three)

---

## 🐍 For Vanna AI Service (Render/Railway)

```bash
DATABASE_URL=postgresql+psycopg://neondb_owner:YOUR_PASSWORD@ep-broad-bush-a1wdclvl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Where to add:**
- Render Dashboard → Your Service → Environment → Add Environment Variable
- Or Railway Dashboard → Your Service → Variables

---

## 🔍 Key Differences

| Service | Protocol | Why |
|---------|----------|-----|
| **Vercel (Prisma)** | `postgresql://` | Prisma uses standard PostgreSQL driver |
| **Vanna (Python)** | `postgresql+psycopg://` | SQLAlchemy needs psycopg driver specification |

**Everything else is identical:**
- ✅ Same username: `neondb_owner`
- ✅ Same password
- ✅ Same host: `ep-broad-bush-a1wdclvl-pooler.ap-southeast-1.aws.neon.tech`
- ✅ Same database: `neondb`
- ✅ Same SSL mode: `?sslmode=require`

---

## 🔐 Other Environment Variables Needed

### For Vercel:
```bash
# Already covered above
DATABASE_URL=postgresql://...

# API routing
NEXT_PUBLIC_API_BASE=/api

# Vanna AI service URL (add after deploying Vanna)
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com

# Groq API Key
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

### For Vanna AI Service:
```bash
# Already covered above
DATABASE_URL=postgresql+psycopg://...

# Groq API Key (same as Vercel)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Port configuration
PORT=8000
PYTHONUNBUFFERED=1
```

---

## 📝 How to Get Your Groq API Key

1. Go to: https://console.groq.com
2. Sign up/Login with GitHub
3. Navigate to: API Keys section
4. Click: "Create API Key"
5. Name it: "Flowbit Analytics"
6. Copy the key (starts with `gsk_`)
7. **Save it securely** - you won't see it again!

---

## ✅ Checklist Before Deploying

- [ ] Have your Neon connection string ready
- [ ] Have your Groq API key
- [ ] Know which format to use for each service:
  - [ ] `postgresql://` for Vercel
  - [ ] `postgresql+psycopg://` for Vanna
- [ ] Environment variables set in both Vercel and Render/Railway

---

## 🚨 Common Mistakes to Avoid

❌ **Don't** use `postgresql://` in Vanna service  
✅ **Do** use `postgresql+psycopg://` in Vanna service

❌ **Don't** forget `?sslmode=require` at the end  
✅ **Do** keep SSL mode parameter

❌ **Don't** commit `.env` files to git  
✅ **Do** set environment variables in hosting dashboards

❌ **Don't** use different passwords for Vercel and Vanna  
✅ **Do** use the same Neon database for both (just different protocol)

---

## 💡 Pro Tips

1. **Copy from your local `.env` file:**
   - Open: `apps/api/.env`
   - Copy the `DATABASE_URL` value
   - Paste in Vercel (as-is)
   - Change `postgresql://` to `postgresql+psycopg://` for Vanna

2. **Test connection first:**
   - Deploy to Vercel
   - Check if app loads
   - Then deploy Vanna AI

3. **Save your URLs:**
   ```
   Vercel URL: https://your-project.vercel.app
   Vanna URL:  https://your-vanna.onrender.com
   Neon DB:    ep-broad-bush-a1wdclvl-pooler.ap-southeast-1.aws.neon.tech
   ```

---

**Ready to deploy? Follow DEPLOYMENT_GUIDE.md step by step!** 🚀
