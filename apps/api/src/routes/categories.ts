import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

/**
 * GET /api/category-spend
 * Returns spending grouped by category
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.extractedData.groupBy({
      by: ["category"],
      where: {
        category: {
          not: null,
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
    });

    const result = categories.map((category) => ({
      category: category.category || "Uncategorized",
      totalSpend: Number(category._sum.totalAmount || 0),
      invoiceCount: category._count.id,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching category spend:", error);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

export { router as categoriesRouter };
