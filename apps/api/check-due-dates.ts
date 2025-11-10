import prisma from "./src/lib/prisma.js";

async function checkDueDates() {
  console.log("\n📅 CHECKING DUE DATES\n");
  console.log("=".repeat(80));

  const today = new Date();
  console.log(`Today: ${today.toISOString().split("T")[0]}\n`);

  // Get all due dates
  const dueDates = await prisma.extractedData.findMany({
    select: {
      dueDate: true,
      totalAmount: true,
      vendorName: true,
      invoice: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  console.log("DUE DATES IN DATABASE:");
  console.log("-".repeat(80));

  let pastDue = 0;
  let futureDue = 0;
  let pastAmount = 0;
  let futureAmount = 0;

  dueDates.forEach((item) => {
    const dueDate = new Date(item.dueDate);
    const isPast = dueDate < today;
    const amount = Number(item.totalAmount || 0);

    if (isPast) {
      pastDue++;
      pastAmount += amount;
    } else {
      futureDue++;
      futureAmount += amount;
    }

    console.log(
      `${dueDate.toISOString().split("T")[0]} | ${isPast ? "❌ PAST" : "✅ FUTURE"} | €${amount.toFixed(2).padStart(10)} | ${item.vendorName} | Status: ${item.invoice?.status || "N/A"}`
    );
  });

  console.log("-".repeat(80));
  console.log(`\nPAST DUE:   ${pastDue} invoices, €${pastAmount.toFixed(2)}`);
  console.log(`FUTURE DUE: ${futureDue} invoices, €${futureAmount.toFixed(2)}`);

  console.log("\n⚠️  ISSUE IDENTIFIED:");
  if (futureDue === 0) {
    console.log("❌ ALL DUE DATES ARE IN THE PAST! Cash outflow chart will be empty.");
    console.log("   The test data in analytics_test_data.json has old dates.");
    console.log("   For a realistic forecast, due dates should be in the future.");
  } else {
    console.log("✅ Some invoices have future due dates.");
  }

  console.log("\n" + "=".repeat(80) + "\n");

  await prisma.$disconnect();
  process.exit(0);
}

checkDueDates().catch((error) => {
  console.error("Error checking due dates:", error);
  process.exit(1);
});
