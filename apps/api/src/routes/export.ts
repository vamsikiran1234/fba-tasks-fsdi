/**
 * Export Routes - CSV/Excel Data Export
 * Bonus Feature: Export dashboard data to CSV/Excel
 */

import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

/**
 * Export invoices to CSV
 * GET /api/export/invoices/csv
 */
router.get("/invoices/csv", async (req, res) => {
  try {
    const { status, startDate, endDate, limit = "1000" } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        extractedData: true,
        validatedData: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
    });

    // Generate CSV
    const headers = [
      "Invoice ID",
      "Invoice Number",
      "Vendor Name",
      "Invoice Date",
      "Due Date",
      "Total Amount",
      "Currency",
      "Category",
      "Status",
      "Uploaded By",
      "Created At",
    ];

    const rows = invoices.map((inv) => {
      const extracted = inv.extractedData[0];
      return [
        inv.id,
        extracted?.invoiceNumber || "N/A",
        extracted?.vendorName || "N/A",
        extracted?.invoiceDate?.toISOString().split("T")[0] || "N/A",
        extracted?.dueDate?.toISOString().split("T")[0] || "N/A",
        extracted?.totalAmount || 0,
        extracted?.currency || "EUR",
        extracted?.category || "Uncategorized",
        inv.status,
        inv.uploadedBy?.name || "N/A",
        inv.createdAt.toISOString().split("T")[0],
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="invoices_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

/**
 * Export vendors summary to CSV
 * GET /api/export/vendors/csv
 */
router.get("/vendors/csv", async (req, res) => {
  try {
    const vendors = await prisma.extractedData.groupBy({
      by: ["vendorName"],
      _sum: {
        totalAmount: true,
        taxAmount: true,
      },
      _count: {
        id: true,
      },
      where: {
        vendorName: {
          not: null,
        },
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
    });

    const headers = ["Vendor Name", "Total Invoices", "Total Spend", "Total Tax"];

    const rows = vendors.map((v) => [
      v.vendorName || "Unknown",
      v._count.id,
      v._sum.totalAmount?.toFixed(2) || "0.00",
      v._sum.taxAmount?.toFixed(2) || "0.00",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="vendors_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Export vendors CSV error:", error);
    res.status(500).json({ error: "Failed to export vendors CSV" });
  }
});

/**
 * Export analytics summary to CSV
 * GET /api/export/analytics/csv
 */
router.get("/analytics/csv", async (req, res) => {
  try {
    // Get monthly summary
    const monthlySummary = await prisma.$queryRaw<
      Array<{
        month: Date;
        count: bigint;
        total: number;
      }>
    >`
      SELECT 
        DATE_TRUNC('month', "invoiceDate") as month,
        COUNT(*) as count,
        SUM("totalAmount") as total
      FROM extracted_data
      WHERE "invoiceDate" >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month DESC
    `;

    const headers = ["Month", "Invoice Count", "Total Amount"];

    const rows = monthlySummary.map((m) => [
      m.month.toISOString().split("T")[0].substring(0, 7), // YYYY-MM format
      m.count.toString(),
      m.total.toFixed(2),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="analytics_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Export analytics CSV error:", error);
    res.status(500).json({ error: "Failed to export analytics CSV" });
  }
});

export default router;
