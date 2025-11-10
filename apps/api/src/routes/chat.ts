import { Router, Request, Response } from "express";
import { z } from "zod";

const router = Router();

// Validation schema
const chatRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  conversationId: z.string().optional(),
});

/**
 * POST /api/chat-with-data
 * Forwards natural language queries to Vanna AI service
 * Returns generated SQL and query results
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    const { query } = validatedData;

    const vannaApiUrl = process.env.VANNA_API_BASE_URL || "http://localhost:8000";

    // Forward request to Vanna AI service
    const response = await fetch(`${vannaApiUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vanna AI service error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { 
      sql: string; 
      results: unknown; 
      explanation: string; 
      conversation_id: string 
    };

    res.json({
      query,
      sql: data.sql,
      results: data.results,
      explanation: data.explanation,
      conversationId: data.conversation_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in chat-with-data:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to process query",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chat-with-data/history
 * Returns chat history (if implemented)
 */
router.get("/history", async (req: Request, res: Response): Promise<void> => {
  try {
    const conversationId = req.query.conversationId as string;

    if (!conversationId) {
      res.status(400).json({ error: "conversationId is required" });
      return;
    }

    // This would typically fetch from a database
    // For now, return empty array
    res.json({
      conversationId,
      messages: [],
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export { router as chatRouter };
