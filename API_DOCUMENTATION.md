# API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-app.vercel.app/api
```

## Authentication
Currently no authentication required (add JWT/API keys for production).

---

## Endpoints

### 1. Get Overview Statistics

**GET** `/api/stats`

Returns dashboard overview metrics.

**Response:**
```json
{
  "totalSpend": {
    "value": 12679.25,
    "change": 8.2,
    "period": "YTD"
  },
  "totalInvoicesProcessed": {
    "value": 64,
    "change": 8.2,
    "period": "from last month"
  },
  "documentsUploaded": {
    "value": 17,
    "change": -9,
    "period": "this month"
  },
  "averageInvoiceValue": {
    "value": 2455.00,
    "change": 8.2,
    "period": "from last month"
  }
}
```

---

### 2. Get Invoice Trends

**GET** `/api/invoice-trends`

Returns monthly invoice count and spend for last 12 months.

**Response:**
```json
[
  {
    "month": "Jan",
    "year": 2025,
    "invoiceCount": 5,
    "totalSpend": 12345.67
  },
  {
    "month": "Feb",
    "year": 2025,
    "invoiceCount": 8,
    "totalSpend": 23456.78
  }
]
```

---

### 3. Get Top 10 Vendors

**GET** `/api/vendors/top10`

Returns top 10 vendors by total spend.

**Response:**
```json
[
  {
    "vendorName": "AcmeCorp",
    "totalSpend": 45678.90,
    "invoiceCount": 12
  },
  {
    "vendorName": "Test Solutions",
    "totalSpend": 34567.89,
    "invoiceCount": 8
  }
]
```

---

### 4. Get All Vendors

**GET** `/api/vendors`

Returns all vendors with spend data.

**Response:**
Same format as top10 but includes all vendors.

---

### 5. Get Category Spend

**GET** `/api/category-spend`

Returns spending grouped by category.

**Response:**
```json
[
  {
    "category": "Operations",
    "totalSpend": 65432.10,
    "invoiceCount": 25
  },
  {
    "category": "Marketing",
    "totalSpend": 43210.98,
    "invoiceCount": 15
  },
  {
    "category": "Facilities",
    "totalSpend": 21098.76,
    "invoiceCount": 10
  }
]
```

---

### 6. Get Cash Outflow Forecast

**GET** `/api/cash-outflow`

Returns expected cash outflow by due date ranges.

**Response:**
```json
[
  {
    "period": "0-7 days",
    "amount": 12345.67,
    "invoiceCount": 5
  },
  {
    "period": "8-30 days",
    "amount": 23456.78,
    "invoiceCount": 8
  },
  {
    "period": "31-60 days",
    "amount": 34567.89,
    "invoiceCount": 12
  },
  {
    "period": "60+ days",
    "amount": 45678.90,
    "invoiceCount": 15
  }
]
```

---

### 7. Get Invoices (Paginated)

**GET** `/api/invoices`

Returns paginated list of invoices with search and filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string) - Search in vendor name, invoice number
- `status` (string) - Filter by status (processed, pending, etc.)
- `vendor` (string) - Filter by vendor name
- `sortBy` (string, default: createdAt) - Field to sort by
- `sortOrder` (string, default: desc) - Sort order (asc/desc)

**Example:**
```
GET /api/invoices?page=1&limit=20&search=Phunix&status=processed
```

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid-here",
      "name": "Invoice-001.pdf",
      "vendorName": "Phunix GmbH",
      "invoiceNumber": "INV-2025-001",
      "invoiceDate": "2025-10-15T00:00:00.000Z",
      "dueDate": "2025-11-15T00:00:00.000Z",
      "amount": 2500.50,
      "currency": "EUR",
      "status": "processed",
      "category": "Operations",
      "uploadedBy": "user@example.com",
      "createdAt": "2025-10-15T10:30:00.000Z",
      "isValidated": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 64,
    "totalPages": 4
  }
}
```

---

### 8. Get Single Invoice

**GET** `/api/invoices/:id`

Returns detailed information about a single invoice.

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Invoice-001.pdf",
  "filePath": "https://...",
  "fileSize": 123456,
  "status": "processed",
  "extractedData": {
    "vendorName": "Phunix GmbH",
    "vendorAddress": "123 Main St, Berlin",
    "invoiceNumber": "INV-2025-001",
    "invoiceDate": "2025-10-15T00:00:00.000Z",
    "dueDate": "2025-11-15T00:00:00.000Z",
    "subtotal": 2100.00,
    "taxAmount": 399.00,
    "totalAmount": 2499.00,
    "currency": "EUR",
    "category": "Operations"
  },
  "lineItems": [
    {
      "description": "Service A",
      "quantity": 2,
      "unitPrice": 1000.00,
      "amount": 2000.00
    }
  ],
  "payments": [],
  "metadata": {
    "modelUsed": "gpt-4",
    "confidence": 0.95
  }
}
```

---

### 9. Chat with Data

**POST** `/api/chat-with-data`

Process natural language queries using Vanna AI.

**Request Body:**
```json
{
  "query": "What is the total spend in the last 90 days?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "query": "What is the total spend in the last 90 days?",
  "sql": "SELECT SUM(total_amount) as total_spend FROM extracted_data WHERE invoice_date >= CURRENT_DATE - INTERVAL '90 days'",
  "results": [
    {
      "total_spend": 45678.90
    }
  ],
  "explanation": "Found 1 results",
  "conversationId": "uuid-here",
  "timestamp": "2025-11-08T10:30:00.000Z"
}
```

---

### 10. Get Chat History

**GET** `/api/chat-with-data/history?conversationId=uuid`

Returns chat conversation history (if implemented).

**Response:**
```json
{
  "conversationId": "uuid-here",
  "messages": []
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": {} // Optional additional details
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting (implement for production).

Recommended limits:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## CORS

CORS is enabled for:
- Development: `http://localhost:3000`
- Production: Your deployed frontend URL

---

## Example Usage (PowerShell)

```powershell
# Get stats
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/stats"
$response | ConvertTo-Json

# Get invoices with search
$params = @{
    page = 1
    limit = 10
    search = "Phunix"
}
$query = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
Invoke-RestMethod -Uri "http://localhost:3001/api/invoices?$query"

# Chat query
$body = @{
    query = "What is the total spend?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/chat-with-data" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## Postman Collection

Import this collection for easy API testing:

```json
{
  "info": {
    "name": "Flowbit Analytics API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Stats",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/stats"
      }
    },
    {
      "name": "Get Invoices",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/invoices?page=1&limit=20"
      }
    },
    {
      "name": "Chat Query",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/chat-with-data",
        "body": {
          "mode": "raw",
          "raw": "{\"query\": \"Total spend?\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    }
  ]
}
```

Save this as `Flowbit-Analytics.postman_collection.json` and import into Postman.
