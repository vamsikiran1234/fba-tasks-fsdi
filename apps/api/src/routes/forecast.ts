import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

/**
 * GET /api/cash-outflow
 * Returns expected cash outflow by due date ranges
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Define date ranges
    const ranges = [
      { label: "0-7 days", start: today, end: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
      {
        label: "8-30 days",
        start: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        label: "31-60 days",
        start: new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        label: "60+ days",
        start: new Date(today.getTime() + 61 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    const forecast = await Promise.all(
      ranges.map(async (range) => {
        const result = await prisma.extractedData.aggregate({
          where: {
            dueDate: {
              gte: range.start,
              lte: range.end,
            },
            invoice: {
              status: {
                in: ["COMPLETED", "PENDING", "PROCESSING"],
              },
            },
          },
          _sum: {
            totalAmount: true,
          },
          _count: {
            id: true,
          },
        });

        return {
          period: range.label,
          amount: Number(result._sum.totalAmount || 0),
          invoiceCount: result._count.id,
        };
      })
    );

    res.json(forecast);
  } catch (error) {
    console.error("Error fetching cash outflow forecast:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow forecast" });
  }
});

export { router as forecastRouter };
