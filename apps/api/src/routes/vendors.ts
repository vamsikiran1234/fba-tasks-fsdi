import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

/**
 * GET /api/vendors/top10
 * Returns top 10 vendors by total spend
 */
router.get("/top10", async (_req: Request, res: Response) => {
  try {
    const vendors = await prisma.extractedData.groupBy({
      by: ["vendorName"],
      where: {
        vendorName: {
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
      take: 10,
    });

    const result = vendors.map((vendor) => ({
      vendorName: vendor.vendorName || "Unknown",
      totalSpend: Number(vendor._sum.totalAmount || 0),
      invoiceCount: vendor._count.id,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching top vendors:", error);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

/**
 * GET /api/vendors
 * Returns all vendors with their spend data
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const vendors = await prisma.extractedData.groupBy({
      by: ["vendorName"],
      where: {
        vendorName: {
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

    const result = vendors.map((vendor) => ({
      vendorName: vendor.vendorName || "Unknown",
      totalSpend: Number(vendor._sum.totalAmount || 0),
      invoiceCount: vendor._count.id,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

export { router as vendorsRouter };
