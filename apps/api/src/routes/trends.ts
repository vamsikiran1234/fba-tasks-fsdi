import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

/**
 * GET /api/invoice-trends
 * Returns monthly invoice count and total spend for the last 12 months
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const monthsBack = 12;
    const trends = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Get invoice count
      const invoiceCount = await prisma.invoice.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
          status: "processed",
        },
      });

      // Get total spend
      const spendResult = await prisma.extractedData.aggregate({
        where: {
          invoice: {
            createdAt: {
              gte: date,
              lt: nextMonth,
            },
          },
        },
        _sum: {
          totalAmount: true,
        },
      });

      trends.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        year: date.getFullYear(),
        invoiceCount,
        totalSpend: Number(spendResult._sum.totalAmount || 0),
      });
    }

    res.json(trends);
  } catch (error) {
    console.error("Error fetching invoice trends:", error);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

export { router as trendsRouter };
