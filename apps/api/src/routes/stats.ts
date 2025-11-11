import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

/**
 * GET /api/stats
 * Returns overview statistics for dashboard cards
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Total Spend (ALL TIME - since dataset has historical data)
    const totalSpendResult = await prisma.extractedData.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    // Previous year comparison (keeping for change calculation)
    const lastYearStart = new Date(currentYear - 1, 0, 1);
    const lastYearEnd = new Date(currentYear - 1, 11, 31);
    const lastYearSpend = await prisma.extractedData.aggregate({
      where: {
        invoiceDate: {
          gte: lastYearStart,
          lte: lastYearEnd,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalSpend = Number(totalSpendResult._sum.totalAmount || 0);
    const lastYearTotal = Number(lastYearSpend._sum.totalAmount || 0);
    const spendChange =
      lastYearTotal > 0 ? ((totalSpend - lastYearTotal) / lastYearTotal) * 100 : 0;

    // Total Invoices Processed (ALL TIME with correct status)
    const totalInvoices = await prisma.invoice.count({
      where: {
        status: "COMPLETED", // Fixed: database uses COMPLETED not processed
      },
    });

    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: lastMonth,
        },
      },
    });

    const invoiceChange =
      lastMonthInvoices > 0 ? ((totalInvoices - lastMonthInvoices) / lastMonthInvoices) * 100 : 0;

    // Documents Uploaded (ALL TIME - dataset has historical uploads)
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const documentsThisMonth = await prisma.invoice.count(); // Total documents

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const documentsLastMonth = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lt: thisMonthStart,
        },
      },
    });

    const documentsChange =
      documentsLastMonth > 0
        ? ((documentsThisMonth - documentsLastMonth) / documentsLastMonth) * 100
        : 0;

    // Average Invoice Value (ALL TIME)
    const avgInvoiceResult = await prisma.extractedData.aggregate({
      _avg: {
        totalAmount: true,
      },
    });

    const lastMonthAvg = await prisma.extractedData.aggregate({
      where: {
        invoiceDate: {
          gte: lastMonth,
          lt: thisMonthStart,
        },
      },
      _avg: {
        totalAmount: true,
      },
    });

    const avgInvoiceValue = Number(avgInvoiceResult._avg.totalAmount || 0);
    const lastMonthAvgValue = Number(lastMonthAvg._avg.totalAmount || 0);
    const avgChange =
      lastMonthAvgValue > 0 ? ((avgInvoiceValue - lastMonthAvgValue) / lastMonthAvgValue) * 100 : 0;

    res.json({
      totalSpend: {
        value: totalSpend,
        change: spendChange,
        period: "YTD",
      },
      totalInvoicesProcessed: {
        value: totalInvoices,
        change: invoiceChange,
        period: "from last month",
      },
      documentsUploaded: {
        value: documentsThisMonth,
        change: documentsChange,
        period: "this month",
      },
      averageInvoiceValue: {
        value: avgInvoiceValue,
        change: avgChange,
        period: "from last month",
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export { router as statsRouter };
