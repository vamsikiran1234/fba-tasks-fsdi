-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "isValidatedByHuman" BOOLEAN NOT NULL DEFAULT false,
    "validatedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "analyticsId" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_metadata" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "modelUsed" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "processingTime" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "aiResponseBaseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_data" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "vendorName" TEXT,
    "vendorAddress" TEXT,
    "vendorEmail" TEXT,
    "vendorPhone" TEXT,
    "vendorTaxId" TEXT,
    "customerName" TEXT,
    "customerAddress" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "purchaseOrderNumber" TEXT,
    "subtotal" DECIMAL(15,2),
    "taxAmount" DECIMAL(15,2),
    "taxRate" DECIMAL(5,2),
    "totalAmount" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'EUR',
    "paymentTerms" TEXT,
    "paymentMethod" TEXT,
    "bankAccount" TEXT,
    "notes" TEXT,
    "category" TEXT DEFAULT 'Operations',
    "validatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracted_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validated_data" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "vendorName" TEXT,
    "vendorAddress" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "subtotal" DECIMAL(15,2),
    "taxAmount" DECIMAL(15,2),
    "totalAmount" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'EUR',
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'validated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validated_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "taxRate" DECIMAL(5,2),
    "taxAmount" DECIMAL(15,2),
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_cache" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "departmentId" TEXT,
    "vendorName" TEXT,
    "category" TEXT,
    "value" DECIMAL(15,2) NOT NULL,
    "count" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_history" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "sql_query" TEXT,
    "results" JSONB,
    "error" TEXT,
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_organizationId_idx" ON "departments"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");

-- CreateIndex
CREATE INDEX "invoices_departmentId_idx" ON "invoices"("departmentId");

-- CreateIndex
CREATE INDEX "invoices_uploadedById_idx" ON "invoices"("uploadedById");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_createdAt_idx" ON "invoices"("createdAt");

-- CreateIndex
CREATE INDEX "invoices_analyticsId_idx" ON "invoices"("analyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_metadata_invoiceId_key" ON "invoice_metadata"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "extracted_data_invoiceId_key" ON "extracted_data"("invoiceId");

-- CreateIndex
CREATE INDEX "extracted_data_vendorName_idx" ON "extracted_data"("vendorName");

-- CreateIndex
CREATE INDEX "extracted_data_invoiceNumber_idx" ON "extracted_data"("invoiceNumber");

-- CreateIndex
CREATE INDEX "extracted_data_invoiceDate_idx" ON "extracted_data"("invoiceDate");

-- CreateIndex
CREATE INDEX "extracted_data_category_idx" ON "extracted_data"("category");

-- CreateIndex
CREATE UNIQUE INDEX "validated_data_invoiceId_key" ON "validated_data"("invoiceId");

-- CreateIndex
CREATE INDEX "line_items_invoiceId_idx" ON "line_items"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "analytics_cache_metricType_periodType_idx" ON "analytics_cache"("metricType", "periodType");

-- CreateIndex
CREATE INDEX "analytics_cache_organizationId_idx" ON "analytics_cache"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_cache_metricType_periodType_periodStart_periodEnd_key" ON "analytics_cache"("metricType", "periodType", "periodStart", "periodEnd", "organizationId", "departmentId", "vendorName", "category");

-- CreateIndex
CREATE INDEX "chat_history_userId_idx" ON "chat_history"("userId");

-- CreateIndex
CREATE INDEX "chat_history_createdAt_idx" ON "chat_history"("createdAt");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_metadata" ADD CONSTRAINT "invoice_metadata_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_data" ADD CONSTRAINT "extracted_data_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validated_data" ADD CONSTRAINT "validated_data_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
