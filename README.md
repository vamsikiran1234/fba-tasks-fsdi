# Flowbit Analytics Platform

> **Full-Stack Analytics Dashboard with AI-Powered Data Chat**

A production-grade monorepo application featuring an interactive analytics dashboard and natural language query interface powered by Vanna AI and Groq LLM.

## 🎯 Overview

This project implements:
- **Interactive Analytics Dashboard** - Real-time metrics, trends, and visualizations
- **AI-Powered Chat Interface** - Natural language queries using Vanna AI + Groq
- **RESTful API Backend** - Express.js with PostgreSQL and Prisma ORM
- **Modern Frontend** - Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui
- **Self-Hosted AI Service** - Python FastAPI with Vanna AI integration

---

## 📁 Project Structure

```
flowbit-analytics-platform/
├── apps/
│   ├── web/                    # Next.js 14 Frontend
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   └── lib/              # Utilities
│   │
│   └── api/                    # Express.js Backend
│       ├── src/
│       │   ├── routes/       # API endpoints
│       │   └── lib/          # Database client
│       └── prisma/
│           ├── schema.prisma # Database schema
│           └── seed.ts       # Data seeding script
│
├── services/
│   └── vanna/                  # Python FastAPI + Vanna AI
│       ├── app.py
│       ├── vanna_config.py
│       └── requirements.txt
│
├── data/
│   └── Analytics_Test_Data.json  # Source data
│
├── package.json                # Root workspace config
└── turbo.json                 # Turborepo configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 14
- **Python** >= 3.10 (for Vanna AI service)
- **Git**

### Step 1: Clone and Install

```powershell
# Clone the repository
git clone <your-repo-url>
cd flowbit-analytics-platform

# Install all dependencies
npm install
```

### Step 2: Setup Database

```powershell
# Create PostgreSQL database
# Using psql or your preferred tool:
createdb flowbit_analytics

# Or in psql:
# CREATE DATABASE flowbit_analytics;
```

### Step 3: Configure Environment Variables

**Backend API** (`apps/api/.env`):
```env
PORT=3001
NODE_ENV=development

# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/flowbit_analytics?schema=public"

# Frontend URL for CORS
FRONTEND_URL="http://localhost:3000"

# Vanna AI Service
VANNA_API_BASE_URL="http://localhost:8000"
VANNA_API_KEY="your-api-key-here"
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Vanna AI Service** (`services/vanna/.env`):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/flowbit_analytics
GROQ_API_KEY=your-groq-api-key
PORT=8000
```

### Step 4: Place Data File

Copy the `Analytics_Test_Data.json` file to the `data/` folder:
```powershell
# Create data directory
mkdir data

# Copy your JSON file
copy C:\Users\vamsi\Downloads\Analytics_Test_Data.json data\
```

### Step 5: Initialize Database

```powershell
# Generate Prisma client
cd apps/api
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with Analytics_Test_Data.json
npm run db:seed

# Go back to root
cd ../..
```

### Step 6: Start Development Servers

```powershell
# Terminal 1 - Start all services (API + Frontend)
npm run dev

# Terminal 2 - Start Vanna AI service
cd services/vanna
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Vanna AI**: http://localhost:8000

---

## 📊 Database Schema

### Entity-Relationship Overview

```
Organizations (1) ──── (N) Departments
      │                         │
      │                         │
     (N)                       (N)
      │                         │
   Users ─────────────────── Invoices
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            InvoiceMetadata ExtractedData ValidatedData
                                │
                      ┌─────────┴─────────┐
                      │                   │
                  LineItems            Payments
```

### Key Tables

- **organizations** - Company/tenant data
- **departments** - Organizational units
- **users** - System users (uploaders, validators)
- **invoices** - Main invoice records
- **extracted_data** - AI-extracted invoice fields
- **validated_data** - Human-validated data
- **line_items** - Invoice line items
- **payments** - Payment transactions
- **invoice_metadata** - AI processing metadata
- **analytics_cache** - Precomputed metrics

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3001/api`

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/stats` | GET | Overview statistics | Total spend, invoice count, averages |
| `/invoice-trends` | GET | Monthly trends (12 months) | Invoice count + spend by month |
| `/vendors/top10` | GET | Top 10 vendors by spend | Vendor name, total spend, invoice count |
| `/vendors` | GET | All vendors with spend data | Complete vendor list |
| `/category-spend` | GET | Spend by category | Category breakdown |
| `/cash-outflow` | GET | Cash outflow forecast | Expected payments by due date |
| `/invoices` | GET | Paginated invoices | Searchable, filterable invoice list |
| `/invoices/:id` | GET | Single invoice details | Full invoice with line items |
| `/chat-with-data` | POST | Natural language query | Generated SQL + results |

### Example API Calls

**Get Statistics:**
```powershell
curl http://localhost:3001/api/stats
```

**Get Invoices with Search:**
```powershell
curl "http://localhost:3001/api/invoices?search=Phunix&page=1&limit=20"
```

**Chat with Data:**
```powershell
curl -X POST http://localhost:3001/api/chat-with-data `
  -H "Content-Type: application/json" `
  -d '{"query": "What is the total spend in the last 90 days?"}'
```

---

## 🤖 Vanna AI Integration

### How It Works

1. **User Input**: Natural language question via chat interface
2. **Frontend → Backend**: Question sent to Express API
3. **Backend → Vanna**: Proxied to Python FastAPI service
4. **Vanna AI**: 
   - Uses Groq LLM to understand query
   - Generates SQL from database schema
   - Executes query on PostgreSQL
   - Returns structured results
5. **Response**: SQL + results + explanation sent back to frontend

### Vanna AI Setup

```powershell
cd services/vanna

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set environment variables
$env:GROQ_API_KEY = "your-groq-api-key"
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/flowbit_analytics"

# Run service
python app.py
```

### Example Queries

- "What's the total spend in the last 90 days?"
- "Show me top 5 vendors by spend"
- "List all overdue invoices"
- "What's the average invoice value by category?"
- "Show invoices processed in October 2025"

---

## 🎨 Frontend Features

### Dashboard View

- **Overview Cards**
  - Total Spend (YTD) with % change
  - Total Invoices Processed
  - Documents Uploaded (This Month)
  - Average Invoice Value

- **Charts**
  - Invoice Volume + Value Trend (Line Chart)
  - Spend by Vendor - Top 10 (Horizontal Bar)
  - Spend by Category (Pie Chart)
  - Cash Outflow Forecast (Bar Chart)

- **Invoices Table**
  - Searchable by vendor name, invoice number
  - Sortable columns
  - Pagination
  - Filter by status, vendor

### Chat with Data View

- Natural language input
- Displays:
  - Generated SQL query
  - Results table
  - Optional chart visualization
- Conversation history (bonus feature)

---

## 🚢 Deployment

### Frontend + Backend (Vercel)

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd apps/web
vercel

# Deploy backend (as serverless functions)
cd ../api
vercel
```

**Environment Variables on Vercel:**
- `DATABASE_URL`
- `VANNA_API_BASE_URL`
- `VANNA_API_KEY`
- `NEXT_PUBLIC_API_URL`

### Vanna AI Service (Railway/Render/Fly.io)

**Using Railway:**
```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Deploy
cd services/vanna
railway up
```

**Using Docker:**
```dockerfile
# services/vanna/Dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "app.py"]
```

```powershell
# Build and run
docker build -t flowbit-vanna .
docker run -p 8000:8000 --env-file .env flowbit-vanna
```

---

## 🧪 Development Commands

```powershell
# Install dependencies
npm install

# Start all services in development
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Database commands
cd apps/api
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio

# Clean workspace
npm run clean
```

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Recharts** for data visualization
- **Lucide Icons**

### Backend
- **Express.js** with TypeScript
- **Prisma** ORM
- **PostgreSQL** database
- **Zod** for validation
- **Helmet** + CORS for security

### AI Service
- **Python 3.10+**
- **FastAPI** framework
- **Vanna AI** for SQL generation
- **Groq** LLM provider
- **psycopg** PostgreSQL adapter

### DevOps
- **Turborepo** monorepo
- **Docker** containerization
- **Vercel** frontend/backend hosting
- **Railway/Render** AI service hosting

---

## 🎁 Bonus Features Implemented

✅ **Persistent Chat History** - Stored in database  
✅ **CSV/Excel Export** - Download invoice data  
✅ **Advanced Filtering** - Multiple filter options  
✅ **Real-time Updates** - Live data refresh  
✅ **Error Handling** - Comprehensive error messages  
✅ **Loading States** - Smooth UI transitions  
✅ **Responsive Design** - Mobile-friendly  
✅ **Docker Support** - Container-ready setup  
✅ **API Documentation** - Complete endpoint docs  
✅ **Performance Optimization** - Caching & indexing  

---

## 📝 Development Notes

### Adding New API Endpoints

1. Create route file in `apps/api/src/routes/`
2. Import and register in `apps/api/src/index.ts`
3. Add types if needed
4. Test with curl or Postman

### Adding New UI Components

1. Create component in `apps/web/components/`
2. Use shadcn/ui primitives
3. Apply Tailwind styling
4. Import and use in pages

### Modifying Database Schema

1. Edit `apps/api/prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Update seed script if needed

---

## 🐛 Troubleshooting

### Database Connection Issues

```powershell
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U username -d flowbit_analytics
```

### Port Already in Use

```powershell
# Find process using port 3000/3001/8000
netstat -ano | findstr :3000

# Kill process (use PID from above)
taskkill /PID <PID> /F
```

### Vanna AI Not Responding

```powershell
# Check Python environment
python --version

# Verify Groq API key
$env:GROQ_API_KEY
```

---

## 📞 Contact & Support

**Developer**: Ande Naga Satya Sai Vamsi Kiran  
**Email**: recruit@flowbitai.com  
**Submission Date**: 10.11.2025

---

## 📄 License

This project is developed as part of the Flowbit AI Full Stack Developer Internship assessment.

---

## 🙏 Acknowledgments

- Figma design reference provided by Flowbit AI
- Analytics test data provided by Flowbit AI
- shadcn/ui for beautiful UI components
- Vanna AI for intelligent SQL generation
- Groq for fast LLM inference

---

**Built with ❤️ for the Flowbit AI Internship**
