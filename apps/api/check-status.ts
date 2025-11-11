import prisma from "./src/lib/prisma.js";

async function checkInvoiceStatus() {
  console.log("\n🔍 CHECKING INVOICE STATUS ISSUE\n");
  console.log("=" .repeat(80));

  // Check invoice statuses
  const statuses = await prisma.invoice.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log("\n1️⃣  INVOICE STATUS DISTRIBUTION:");
  console.log("-".repeat(80));
  statuses.forEach((s) => {
    console.log(`   ${s.status}: ${s._count} invoices`);
  });

  // Check what the stats endpoint is looking for
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);

  const processedInvoices = await prisma.invoice.count({
    where: {
      status: "processed",
      createdAt: { gte: yearStart },
    },
  });

  const completedInvoices = await prisma.invoice.count({
    where: {
      status: "COMPLETED",
      createdAt: { gte: yearStart },
    },
  });

  console.log("\n2️⃣  INVOICES BY STATUS (YTD):");
  console.log("-".repeat(80));
  console.log(`   With status 'processed': ${processedInvoices}`);
  console.log(`   With status 'COMPLETED': ${completedInvoices}`);

  // Check extracted data
  const totalSpendResult = await prisma.extractedData.aggregate({
    where: {
      invoiceDate: { gte: yearStart },
    },
    _sum: { totalAmount: true },
    _count: true,
  });

  console.log("\n3️⃣  EXTRACTED DATA (YTD):");
  console.log("-".repeat(80));
  console.log(`   Total Records: ${totalSpendResult._count}`);
  console.log(`   Total Spend: €${totalSpendResult._sum.totalAmount?.toFixed(2) || 0}`);

  // Check sample invoice dates
  const sampleInvoices = await prisma.extractedData.findMany({
    take: 5,
    orderBy: { invoiceDate: "desc" },
    select: {
      vendorName: true,
      invoiceNumber: true,
      invoiceDate: true,
      totalAmount: true,
    },
  });

  console.log("\n4️⃣  SAMPLE INVOICE DATES:");
  console.log("-".repeat(80));
  sampleInvoices.forEach((inv) => {
    console.log(
      `   ${inv.vendorName} | ${inv.invoiceNumber} | ${inv.invoiceDate?.toISOString().split("T")[0]} | €${inv.totalAmount}`
    );
  });

  console.log("\n" + "=".repeat(80));
  console.log("✅ CHECK COMPLETE\n");

  await prisma.$disconnect();
}

checkInvoiceStatus().catch(console.error);
