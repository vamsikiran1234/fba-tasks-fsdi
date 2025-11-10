import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { statsRouter } from "./routes/stats.js";
import { invoicesRouter } from "./routes/invoices.js";
import { trendsRouter } from "./routes/trends.js";
import { vendorsRouter } from "./routes/vendors.js";
import { categoriesRouter } from "./routes/categories.js";
import { forecastRouter } from "./routes/forecast.js";
import { chatRouter } from "./routes/chat.js";
import exportRouter from "./routes/export.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Flowbit AI Analytics API",
    version: "1.0.0",
    endpoints: [
      "/health",
      "/api/stats",
      "/api/invoices",
      "/api/invoice-trends",
      "/api/vendors",
      "/api/category-spend",
      "/api/cash-outflow",
      "/api/chat-with-data",
      "/api/export/*",
    ],
  });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/stats", statsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/invoice-trends", trendsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/category-spend", categoriesRouter);
app.use("/api/cash-outflow", forecastRouter);
app.use("/api/chat-with-data", chatRouter);
app.use("/api/export", exportRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Start server (only in development, not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
