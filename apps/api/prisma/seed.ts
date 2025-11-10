import { PrismaClient, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface InvoiceData {
  _id: string;
  name: string;
  filePath: string;
  fileSize: { $numberLong: string };
  fileType: string;
  status: string;
  organizationId: string;
  departmentId: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  metadata?: any;
  isValidatedByHuman: boolean;
  uploadedById: string;
  extractedData?: any;
  processedAt?: { $date: string };
  validatedData?: any;
  analyticsId?: string;
  assignedToId?: string;
  assignedAt?: { $date: string };
  templateId?: string | null;
  filenameSource?: string;
}

// Helper function to normalize status values
function normalizeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    processed: "COMPLETED",
    processing: "PROCESSING",
    pending: "PENDING",
    uploaded: "PENDING",
    failed: "FAILED",
    validated: "COMPLETED",
  };

  return statusMap[status.toLowerCase()] || status.toUpperCase();
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Read the JSON file from Downloads folder (adjust path as needed)
  const dataPath = path.join(process.cwd(), "../../data/Analytics_Test_Data.json");

  let invoicesData: InvoiceData[] = [];

  try {
    const rawData = fs.readFileSync(dataPath, "utf-8");
    invoicesData = JSON.parse(rawData);
    console.log(`📊 Loaded ${invoicesData.length} invoices from JSON file`);
  } catch (error) {
    console.error("❌ Error reading data file:", error);
    console.log("💡 Make sure Analytics_Test_Data.json is in the /data folder");
    process.exit(1);
  }

  // Extract unique organizations, departments, and users
  const uniqueOrgs = new Set<string>();
  const uniqueDepts = new Set<string>();
  const uniqueUsers = new Set<string>();

  invoicesData.forEach((invoice) => {
    uniqueOrgs.add(invoice.organizationId);
    uniqueDepts.add(invoice.departmentId);
    uniqueUsers.add(invoice.uploadedById);
    if (invoice.assignedToId) uniqueUsers.add(invoice.assignedToId);
  });

  console.log(`\n📈 Found:`);
  console.log(`   - ${uniqueOrgs.size} organizations`);
  console.log(`   - ${uniqueDepts.size} departments`);
  console.log(`   - ${uniqueUsers.size} users`);

  // Clear existing data
  console.log("\n🧹 Cleaning existing data...");
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.validatedData.deleteMany();
  await prisma.extractedData.deleteMany();
  await prisma.invoiceMetadata.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.analyticsCache.deleteMany();

  // Create organizations
  console.log("\n🏢 Creating organizations...");
  for (const orgId of uniqueOrgs) {
    await prisma.organization.create({
      data: {
        id: orgId,
        name: `Organization ${orgId.slice(-8)}`,
      },
    });
  }

  // Create departments
  console.log("🏬 Creating departments...");
  const deptOrgMap = new Map<string, string>();
  invoicesData.forEach((invoice) => {
    if (!deptOrgMap.has(invoice.departmentId)) {
      deptOrgMap.set(invoice.departmentId, invoice.organizationId);
    }
  });

  for (const [deptId, orgId] of deptOrgMap.entries()) {
    await prisma.department.create({
      data: {
        id: deptId,
        name: `Department ${deptId.slice(-8)}`,
        organizationId: orgId,
      },
    });
  }

  // Create users with realistic emails
  console.log("👥 Creating users...");
  const userEmails = [
    "shahsoham93@gmail.com",
    "flowbitai_orgadmin@yopmail.com",
    "admin@flowbit.ai",
    "user@flowbit.ai",
    "validator@flowbit.ai",
  ];

  let emailIndex = 0;
  for (const userId of uniqueUsers) {
    const email = userEmails[emailIndex % userEmails.length];
    const orgId = Array.from(uniqueOrgs)[0]; // Assign to first org

    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId.slice(-8)}_${email}`,
        name: `User ${userId.slice(-8)}`,
        role: emailIndex === 0 ? "admin" : "user",
        organizationId: orgId,
      },
    });
    emailIndex++;
  }

  // Create invoices with related data
  console.log("📄 Creating invoices and related data...");
  let processedCount = 0;

  for (const invoiceData of invoicesData) {
    try {
      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          id: invoiceData._id,
          name: invoiceData.name,
          filePath: invoiceData.filePath,
          fileSize: BigInt(invoiceData.fileSize.$numberLong),
          fileType: invoiceData.fileType,
          status: normalizeStatus(invoiceData.status),
          organizationId: invoiceData.organizationId,
          departmentId: invoiceData.departmentId,
          uploadedById: invoiceData.uploadedById,
          assignedToId: invoiceData.assignedToId || null,
          assignedAt: invoiceData.assignedAt ? new Date(invoiceData.assignedAt.$date) : null,
          isValidatedByHuman: invoiceData.isValidatedByHuman,
          processedAt: invoiceData.processedAt ? new Date(invoiceData.processedAt.$date) : null,
          createdAt: new Date(invoiceData.createdAt.$date),
          updatedAt: new Date(invoiceData.updatedAt.$date),
          analyticsId: invoiceData.analyticsId || null,
        },
      });

      // Create metadata if exists
      if (invoiceData.metadata) {
        await prisma.invoiceMetadata.create({
          data: {
            invoiceId: invoice.id,
            modelUsed: invoiceData.metadata.modelUsed || null,
            promptTokens: invoiceData.metadata.promptTokens || null,
            completionTokens: invoiceData.metadata.completionTokens || null,
            totalTokens: invoiceData.metadata.totalTokens || null,
            processingTime: invoiceData.metadata.processingTime || null,
            confidence: invoiceData.metadata.confidence || null,
            aiResponseBaseUrl: invoiceData.metadata.aiResponseBaseUrl || null,
          },
        });
      }

      // Create extracted data if exists
      if (invoiceData.extractedData && Object.keys(invoiceData.extractedData).length > 0) {
        const ed = invoiceData.extractedData;
        const llm = ed.llmData || {};

        // Extract values from nested LLM structure
        const vendorData = llm.vendor?.value || {};
        const invoiceData2 = llm.invoice?.value || {};
        const paymentData = llm.payment?.value || {};
        const summaryData = llm.summary?.value || {};
        const customerData = llm.customer?.value || {};

        await prisma.extractedData.create({
          data: {
            invoiceId: invoice.id,
            vendorName: vendorData.vendorName?.value || null,
            vendorAddress: vendorData.vendorAddress?.value || null,
            vendorEmail: vendorData.vendorEmail?.value || null,
            vendorPhone: vendorData.vendorPhone?.value || null,
            vendorTaxId: vendorData.vendorTaxId?.value || null,
            customerName: customerData.customerName?.value || null,
            customerAddress: customerData.customerAddress?.value || null,
            invoiceNumber: invoiceData2.invoiceId?.value || null,
            invoiceDate: invoiceData2.invoiceDate?.value
              ? new Date(invoiceData2.invoiceDate.value)
              : null,
            dueDate: paymentData.dueDate?.value ? new Date(paymentData.dueDate.value) : null,
            subtotal:
              summaryData.subTotal?.value != null
                ? new Prisma.Decimal(Math.abs(summaryData.subTotal.value))
                : null,
            taxAmount:
              summaryData.totalTax?.value != null
                ? new Prisma.Decimal(Math.abs(summaryData.totalTax.value))
                : null,
            taxRate: null,
            totalAmount:
              summaryData.invoiceTotal?.value != null
                ? new Prisma.Decimal(Math.abs(summaryData.invoiceTotal.value))
                : null,
            currency: summaryData.currencySymbol?.value || "EUR",
            paymentTerms: paymentData.paymentTerms?.value || null,
            paymentMethod: paymentData.paymentMethod?.value || null,
            category: "Operations",
            validatedBy: null,
          },
        });

        // Create line items if they exist
        const lineItemsData = llm.lineItems?.value?.items?.value || [];
        if (Array.isArray(lineItemsData) && lineItemsData.length > 0) {
          for (const item of lineItemsData) {
            const desc = item.description?.value || item.name?.value || "Item";
            const qty = item.quantity?.value || 1;
            const price = item.unitPrice?.value || 0;
            const total = item.totalPrice?.value || item.amount?.value || 0;

            await prisma.lineItem.create({
              data: {
                invoiceId: invoice.id,
                description: desc,
                quantity: new Prisma.Decimal(Math.abs(qty)),
                unitPrice: new Prisma.Decimal(Math.abs(price)),
                amount: new Prisma.Decimal(Math.abs(total)),
                taxRate: item.taxRate?.value ? new Prisma.Decimal(item.taxRate.value) : null,
                taxAmount: item.taxAmount?.value
                  ? new Prisma.Decimal(Math.abs(item.taxAmount.value))
                  : null,
                category: null,
              },
            });
          }
        }
      }

      // Create validated data if exists
      if (invoiceData.validatedData && Object.keys(invoiceData.validatedData).length > 0) {
        const vd = invoiceData.validatedData;

        await prisma.validatedData.create({
          data: {
            invoiceId: invoice.id,
            vendorName: vd.vendorName || null,
            vendorAddress: vd.vendorAddress || null,
            invoiceNumber: vd.invoiceNumber || null,
            invoiceDate: vd.invoiceDate ? new Date(vd.invoiceDate) : null,
            dueDate: vd.dueDate ? new Date(vd.dueDate) : null,
            subtotal: vd.subtotal ? new Prisma.Decimal(vd.subtotal) : null,
            taxAmount: vd.taxAmount ? new Prisma.Decimal(vd.taxAmount) : null,
            totalAmount: vd.totalAmount ? new Prisma.Decimal(vd.totalAmount) : null,
            currency: vd.currency || "EUR",
            category: vd.category || null,
            status: vd.status || "validated",
          },
        });
      }

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`   Processed ${processedCount}/${invoicesData.length} invoices...`);
      }
    } catch (error) {
      console.error(`❌ Error processing invoice ${invoiceData._id}:`, error);
    }
  }

  console.log(`\n✅ Successfully seeded ${processedCount} invoices!`);

  // Generate some analytics cache for better performance
  console.log("\n📊 Generating analytics cache...");

  const stats = await prisma.extractedData.aggregate({
    _sum: {
      totalAmount: true,
    },
    _avg: {
      totalAmount: true,
    },
    _count: true,
  });

  console.log("\n📈 Database Statistics:");
  console.log(`   - Total Invoices: ${processedCount}`);
  console.log(`   - Total Spend: €${stats._sum.totalAmount || 0}`);
  console.log(`   - Average Invoice: €${stats._avg.totalAmount || 0}`);

  console.log("\n✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
