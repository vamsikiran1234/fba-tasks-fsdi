"""
Vanna AI Configuration
Connects to PostgreSQL and uses Groq LLM for SQL generation
"""

import os
from groq import Groq
import psycopg2
from psycopg2.extras import RealDictCursor
import json

class VannaConfig:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        # Initialize Groq client for SQL generation
        self.groq_client = Groq(api_key=self.groq_api_key)
        
        # Connect to PostgreSQL
        self.db_connection = None
        self.connect_to_database()
        
    def connect_to_database(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_connection = psycopg2.connect(
                self.database_url,
                cursor_factory=RealDictCursor
            )
            print("✅ Connected to PostgreSQL database")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise
    
    def get_database_schema(self):
        """Get database schema for context"""
        return """
        Database Schema (PostgreSQL with camelCase columns - MUST USE DOUBLE QUOTES):
        
        1. extracted_data - Main invoice data table
           - "id": VARCHAR (Primary Key)
           - "invoiceId": VARCHAR (Foreign Key → invoices.id)
           - "vendorName": VARCHAR
           - "vendorAddress": VARCHAR
           - "invoiceNumber": VARCHAR
           - "invoiceDate": DATE
           - "dueDate": DATE
           - "subtotal": DECIMAL(15,2)
           - "taxAmount": DECIMAL(15,2)
           - "totalAmount": DECIMAL(15,2)
           - "currency": VARCHAR
           - "category": VARCHAR
           - "createdAt": TIMESTAMP
           - "updatedAt": TIMESTAMP
        
        2. invoices - Invoice metadata
           - "id": VARCHAR (Primary Key)
           - "name": VARCHAR
           - "status": VARCHAR (ENUM: PENDING, APPROVED, REJECTED, PAID)
             * "PENDING" = Not yet processed/reviewed
             * "APPROVED", "REJECTED", "PAID" = Processed invoices (have been reviewed)
           - "organizationId": VARCHAR
           - "processedAt": TIMESTAMP (when status changed from PENDING)
           - "createdAt": TIMESTAMP
           - "updatedAt": TIMESTAMP
        
        3. line_items - Individual invoice line items
           - "id": VARCHAR (Primary Key)
           - "invoiceId": VARCHAR (Foreign Key → invoices.id)
           - "description": VARCHAR
           - "quantity": DECIMAL(10,2)
           - "unitPrice": DECIMAL(15,2)
           - "amount": DECIMAL(15,2)
           - "category": VARCHAR
        
        CRITICAL RULES FOR SQL GENERATION:
        1. ALL column names MUST be wrapped in double quotes: "columnName" 
        2. Table aliases (ed, i, li) do NOT need quotes
        3. For invoice status queries, JOIN with invoices table
        4. For tax queries, use "taxAmount" column from extracted_data
        5. Examples:
           ✅ CORRECT: SELECT ed."invoiceId", ed."totalAmount" FROM extracted_data ed
           ❌ WRONG: SELECT ed.invoiceId, ed.totalAmount FROM extracted_data ed
        
        Common query patterns (ALWAYS use double quotes on columns):
        - Total spend: SELECT SUM("totalAmount") FROM extracted_data
        - Tax amount: SELECT SUM("taxAmount") FROM extracted_data WHERE EXTRACT(YEAR FROM "invoiceDate") = EXTRACT(YEAR FROM CURRENT_DATE)
        - Count all invoices: SELECT COUNT(*) FROM invoices
        - Count processed invoices: SELECT COUNT(*) FROM invoices i WHERE i."status" IN ('APPROVED', 'REJECTED', 'PAID')
        - Pending invoices: SELECT COUNT(*) FROM invoices i WHERE i."status" = 'PENDING'
        - Invoice with status: SELECT ed."vendorName", ed."totalAmount", i."status" FROM extracted_data ed JOIN invoices i ON ed."invoiceId" = i."id" WHERE i."status" = 'PENDING'
        - Top vendors: SELECT "vendorName", SUM("totalAmount") as total FROM extracted_data GROUP BY "vendorName" ORDER BY total DESC LIMIT 10
        - Monthly trends: SELECT DATE_TRUNC('month', "invoiceDate") as month, COUNT(*) as count, SUM("totalAmount") as total FROM extracted_data GROUP BY month ORDER BY month
        - With alias: SELECT ed."invoiceId", ed."vendorName", ed."totalAmount" FROM extracted_data ed WHERE ed."invoiceDate" >= CURRENT_DATE - INTERVAL '90 days'
        """
    
    def generate_sql(self, question: str) -> str:
        """Generate SQL from natural language question using Groq"""
        try:
            schema = self.get_database_schema()
            
            prompt = f"""{schema}

User question: {question}

Generate a PostgreSQL query to answer this question. Return ONLY the SQL query, no explanations or markdown.

CRITICAL REQUIREMENTS:
1. ALL column names MUST be wrapped in double quotes: "columnName"
2. When using table aliases, format as: alias."columnName" (e.g., ed."invoiceId", ed."totalAmount")
3. Use proper PostgreSQL syntax
4. Handle NULL values appropriately
5. Use appropriate aggregations
6. Include ORDER BY for sorted results
7. Limit results to reasonable numbers (e.g., LIMIT 10-100 for lists)

Examples of CORRECT syntax:
- SELECT "vendorName", "totalAmount" FROM extracted_data
- SELECT ed."invoiceId", ed."vendorName" FROM extracted_data ed
- SELECT SUM("totalAmount") FROM extracted_data WHERE "invoiceDate" >= '2025-01-01'
"""

            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=500
            )
            
            sql = response.choices[0].message.content
            
            if not sql or sql.strip() == "":
                raise ValueError(f"Groq returned empty SQL for question: {question}")
            
            sql = sql.strip()
            
            # Clean up the SQL (remove markdown code blocks if present)
            if sql.startswith("```"):
                sql = sql.split("\n", 1)[1] if "\n" in sql else sql  # Remove first line
                sql = sql.rsplit("\n", 1)[0] if "\n" in sql else sql  # Remove last line
                sql = sql.replace("```", "")
            
            sql = sql.strip()
            
            if not sql:
                raise ValueError(f"Failed to generate valid SQL for question: {question}")
            
            print(f"✅ Generated SQL: {sql}")
            return sql
            
        except Exception as e:
            print(f"❌ SQL generation failed: {e}")
            raise
    
    def run_sql(self, sql: str):
        """Execute SQL and return results"""
        try:
            cursor = self.db_connection.cursor()
            cursor.execute(sql)
            
            # Check if query returns results
            if cursor.description is None:
                return {"rows": [], "columns": []}
            
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            # Convert to list of dicts
            results = [dict(row) for row in rows]
            
            # Convert Decimal to float for JSON serialization
            for row in results:
                for key, value in row.items():
                    if hasattr(value, '__float__'):
                        row[key] = float(value)
                    elif hasattr(value, 'isoformat'):
                        row[key] = value.isoformat()
            
            cursor.close()
            
            print(f"✅ Query executed: {len(results)} rows returned")
            return {
                "columns": columns,
                "rows": results,
                "row_count": len(results)
            }
            
        except Exception as e:
            print(f"❌ SQL execution failed: {e}")
            self.db_connection.rollback()
            raise
    
    def ask(self, question: str):
        """Complete workflow: question -> SQL -> results"""
        try:
            # Generate SQL
            sql = self.generate_sql(question)
            
            # Execute SQL
            result = self.run_sql(sql)
            
            # Generate explanation using Groq
            explanation = self.generate_explanation(question, sql, result)
            
            return {
                'question': question,
                'sql': sql,
                'results': result['rows'],
                'columns': result['columns'],
                'row_count': result['row_count'],
                'explanation': explanation
            }
            
        except Exception as e:
            print(f"❌ Query failed: {e}")
            return {
                'question': question,
                'error': str(e),
                'sql': None,
                'results': [],
                'row_count': 0
            }
    
    def generate_explanation(self, question: str, sql: str, result: dict) -> str:
        """Generate human-readable explanation of the query results"""
        try:
            prompt = f"""User asked: "{question}"

SQL query executed:
{sql}

Results: {result['row_count']} rows returned

Provide a brief, natural language summary of these results (2-3 sentences max)."""

            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=150
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Query executed successfully, returning {result['row_count']} rows."
    
    def close(self):
        """Close database connection"""
        if self.db_connection:
            self.db_connection.close()
            print("✅ Database connection closed")

# Global instance
vanna_config = None

def get_vanna():
    """Get or create Vanna instance"""
    global vanna_config
    if vanna_config is None:
        vanna_config = VannaConfig()
    return vanna_config
