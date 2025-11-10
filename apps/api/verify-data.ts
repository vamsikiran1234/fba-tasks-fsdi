import prisma from "./src/lib/prisma.js";

async function verifyData() {
  console.log("\n📊 VERIFYING DATABASE DATA\n");
  console.log("=".repeat(80));

  // Check vendors
  console.log("\n1️⃣  TOP 10 VENDORS (from analytics_test_data.json):");
  console.log("-".repeat(80));
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

  vendors.forEach((vendor, index) => {
    console.log(
      `${index + 1}. ${vendor.vendorName?.padEnd(40)} €${Number(vendor._sum.totalAmount || 0)
        .toFixed(2)
        .padStart(10)} (${vendor._count.id} invoices)`
    );
  });

  const totalVendorSpend = vendors.reduce((sum, v) => sum + Number(v._sum.totalAmount || 0), 0);
  console.log("-".repeat(80));
  console.log(`TOTAL (Top 10): €${totalVendorSpend.toFixed(2)}`);

  // Check categories
  console.log("\n2️⃣  SPENDING BY CATEGORY:");
  console.log("-".repeat(80));
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

  categories.forEach((category, index) => {
    console.log(
      `${index + 1}. ${(category.category || "Uncategorized").padEnd(30)} €${Number(
        category._sum.totalAmount || 0
      )
        .toFixed(2)
        .padStart(10)} (${category._count.id} invoices)`
    );
  });

  const totalCategorySpend = categories.reduce(
    (sum, c) => sum + Number(c._sum.totalAmount || 0),
    0
  );
  console.log("-".repeat(80));
  console.log(`TOTAL: €${totalCategorySpend.toFixed(2)}`);

  // Check cash outflow
  console.log("\n3️⃣  CASH OUTFLOW FORECAST (by due date):");
  console.log("-".repeat(80));

  const today = new Date();
  const periods = [
    { label: "0-7 days", start: 0, end: 7 },
    { label: "8-30 days", start: 8, end: 30 },
    { label: "31-60 days", start: 31, end: 60 },
    { label: "60+ days", start: 61, end: 365 },
  ];

  for (const period of periods) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + period.start);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + period.end);

    const result = await prisma.extractedData.aggregate({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
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

    console.log(
      `${period.label.padEnd(15)} €${Number(result._sum.totalAmount || 0)
        .toFixed(2)
        .padStart(10)} (${result._count.id} invoices)`
    );
  }

  // Check invoice statuses
  console.log("\n4️⃣  INVOICE STATUS DISTRIBUTION:");
  console.log("-".repeat(80));
  const statuses = await prisma.invoice.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  statuses.forEach((status) => {
    console.log(`${status.status.padEnd(15)} ${status._count.id} invoices`);
  });

  // Check total data
  console.log("\n5️⃣  OVERALL TOTALS:");
  console.log("-".repeat(80));
  const totalInvoices = await prisma.invoice.count();
  const totalExtractedData = await prisma.extractedData.count();
  const totalSpend = await prisma.extractedData.aggregate({
    _sum: {
      totalAmount: true,
    },
  });

  console.log(`Total Invoices: ${totalInvoices}`);
  console.log(`Total Extracted Data Records: ${totalExtractedData}`);
  console.log(`Total Spend: €${Number(totalSpend._sum.totalAmount || 0).toFixed(2)}`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ DATA VERIFICATION COMPLETE\n");

  await prisma.$disconnect();
  process.exit(0);
}

verifyData().catch((error) => {
  console.error("Error verifying data:", error);
  process.exit(1);
});
