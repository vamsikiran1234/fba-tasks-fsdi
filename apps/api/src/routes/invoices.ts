import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

const router = Router();

/**
 * GET /api/invoices
 * Returns paginated list of invoices with filtering and search
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - search: string (searches in vendor name, invoice number)
 * - status: string (filter by status)
 * - vendor: string (filter by vendor name)
 * - sortBy: string (field to sort by)
 * - sortOrder: 'asc' | 'desc'
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const vendor = req.query.vendor as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.InvoiceWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search || vendor) {
      where.extractedData = {};

      if (search) {
        where.OR = [
          {
            extractedData: {
              vendorName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            extractedData: {
              invoiceNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (vendor) {
        where.extractedData = {
          vendorName: {
            equals: vendor,
          },
        };
      }
    }

    // Get total count
    const totalCount = await prisma.invoice.count({ where });

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        extractedData: {
          select: {
            vendorName: true,
            invoiceNumber: true,
            invoiceDate: true,
            dueDate: true,
            totalAmount: true,
            currency: true,
            category: true,
          },
        },
        validatedData: {
          select: {
            status: true,
          },
        },
        uploadedBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      name: invoice.name,
      vendorName: invoice.extractedData?.vendorName || "Unknown",
      invoiceNumber: invoice.extractedData?.invoiceNumber || "N/A",
      invoiceDate: invoice.extractedData?.invoiceDate,
      dueDate: invoice.extractedData?.dueDate,
      amount: invoice.extractedData?.totalAmount ? Number(invoice.extractedData.totalAmount) : 0,
      currency: invoice.extractedData?.currency || "EUR",
      status: invoice.status,
      category: invoice.extractedData?.category || "Uncategorized",
      uploadedBy: invoice.uploadedBy.email,
      createdAt: invoice.createdAt,
      isValidated: invoice.isValidatedByHuman,
    }));

    res.json({
      invoices: formattedInvoices,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

/**
 * GET /api/invoices/:id
 * Returns a single invoice with full details
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        extractedData: true,
        validatedData: true,
        metadata: true,
        lineItems: true,
        payments: true,
        uploadedBy: {
          select: {
            email: true,
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }

    // Format the response
    const formattedInvoice = {
      ...invoice,
      extractedData: invoice.extractedData
        ? {
            ...invoice.extractedData,
            subtotal: invoice.extractedData.subtotal
              ? Number(invoice.extractedData.subtotal)
              : null,
            taxAmount: invoice.extractedData.taxAmount
              ? Number(invoice.extractedData.taxAmount)
              : null,
            totalAmount: invoice.extractedData.totalAmount
              ? Number(invoice.extractedData.totalAmount)
              : null,
          }
        : null,
      lineItems: invoice.lineItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount: Number(item.amount),
        taxAmount: item.taxAmount ? Number(item.taxAmount) : null,
      })),
      payments: invoice.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };

    res.json(formattedInvoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

export { router as invoicesRouter };
