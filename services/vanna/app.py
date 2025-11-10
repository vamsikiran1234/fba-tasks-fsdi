"""
Vanna AI FastAPI Service
Handles natural language queries and converts them to SQL
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Vanna configuration
from vanna_config import get_vanna

# Initialize FastAPI
app = FastAPI(
    title="Flowbit Vanna AI Service",
    description="Natural language to SQL query service using Vanna AI and Groq",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class QueryRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None

class QueryResponse(BaseModel):
    query: str
    sql: str
    results: List[Dict[str, Any]]
    explanation: Optional[str] = None
    conversation_id: Optional[str] = None
    row_count: int

@app.on_event("startup")
async def startup_event():
    """Initialize Vanna on startup"""
    print("🚀 Starting Vanna AI Service...")
    print(f"📊 Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
    print(f"🤖 Groq API Key: {'Set ✅' if os.getenv('GROQ_API_KEY') else 'Not set ❌'}")
    
    try:
        vanna = get_vanna()
        print("✅ Vanna AI Service initialized successfully")
        print("💡 Ready to answer natural language questions about your data!")
    except Exception as e:
        print(f"❌ Vanna initialization failed: {e}")
        print("⚠️  Service will still respond but may have limited functionality")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Flowbit Vanna AI",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected" if os.getenv('DATABASE_URL') else "not configured",
        "groq": "configured" if os.getenv('GROQ_API_KEY') else "not configured"
    }

@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process natural language query and return SQL + results
    
    Example queries:
    - "What is the total spend in the last 90 days?"
    - "Show me top 5 vendors by spend"
    - "List all overdue invoices"
    - "What's the average invoice value by category?"
    """
    try:
        # Get Vanna instance
        vanna = get_vanna()
        
        # Process query
        result = vanna.ask(request.query)
        
        # Generate explanation
        explanation = f"Found {result['row_count']} results"
        
        return QueryResponse(
            query=request.query,
            sql=result['sql'],
            results=result['results'],
            explanation=explanation,
            conversation_id=request.conversation_id,
            row_count=result['row_count']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Query processing failed: {str(e)}"
        )

@app.post("/api/generate-sql")
async def generate_sql_only(request: QueryRequest):
    """Generate SQL without executing it"""
    try:
        vanna = get_vanna()
        sql = vanna.generate_sql(request.query)
        
        return {
            "query": request.query,
            "sql": sql
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SQL generation failed: {str(e)}"
        )

@app.get("/api/sample-queries")
async def get_sample_queries():
    """Return sample queries users can try"""
    return {
        "queries": [
            "What is the total spend in the last 90 days?",
            "Show me top 5 vendors by spend",
            "List all invoices from October 2025",
            "What's the average invoice value?",
            "Show invoices grouped by category",
            "How many invoices are there in total?",
            "How many invoices have APPROVED or PAID status?",
            "List overdue invoices",
            "What's the total spend by vendor Phunix GmbH?",
            "Show all invoices above €1000",
            "What are the most recent 10 invoices?"
        ]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    print(f"\n{'='*50}")
    print(f"🤖 Flowbit Vanna AI Service")
    print(f"{'='*50}\n")
    print(f"📡 Server: http://localhost:{port}")
    print(f"📚 Docs: http://localhost:{port}/docs")
    print(f"🔍 Health: http://localhost:{port}/health")
    print(f"\n{'='*50}\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
