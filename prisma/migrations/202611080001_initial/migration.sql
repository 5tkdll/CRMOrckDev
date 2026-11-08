-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CompanyAssessment" AS ENUM ('UNREVIEWED', 'POTENTIAL', 'HAS_WEBSITE', 'INSUFFICIENT_DATA', 'DUPLICATE', 'DISCARDED');

-- CreateEnum
CREATE TYPE "PermissionStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'REFUSED', 'REVOKED');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('RESEARCHED', 'CONTACT_PENDING', 'CONTACTED', 'INTERESTED', 'PROPOSAL_SENT', 'AWAITING_PAYMENT', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('CALL', 'MANUAL_MESSAGE', 'RESPONSE', 'MEETING', 'NOTE', 'PROPOSAL', 'REFUSAL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('AWAITING_PAYMENT', 'AWAITING_CONTENT', 'IN_PRODUCTION', 'CLIENT_REVIEW', 'ADJUSTMENTS', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_TRACKED', 'PENDING', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "ServiceKind" AS ENUM ('DOMAIN', 'HOSTING');

-- CreateEnum
CREATE TYPE "RenewalResponsible" AS ENUM ('ORCK_DEV', 'CLIENT');

-- CreateEnum
CREATE TYPE "Periodicity" AS ENUM ('MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('NOT_NOTIFIED', 'NOTIFIED', 'AWAITING_RESPONSE', 'RENEWAL_RECORDED');

-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('REVIEWING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('PENDING', 'READY', 'INVALID', 'POSSIBLE_DUPLICATE', 'SKIPPED', 'IMPORTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT,
    "address" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" VARCHAR(2),
    "phoneOriginal" TEXT,
    "phoneNormalized" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "assessment" "CompanyAssessment" NOT NULL DEFAULT 'UNREVIEWED',
    "doNotContact" BOOLEAN NOT NULL DEFAULT false,
    "doNotContactReason" TEXT,
    "notes" TEXT,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "name" TEXT,
    "position" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_sources" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "url" TEXT,
    "researchedAt" TIMESTAMPTZ(3),
    "notes" TEXT,

    CONSTRAINT "research_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_permissions" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "status" "PermissionStatus" NOT NULL DEFAULT 'PENDING',
    "recordedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidence" TEXT,
    "notes" TEXT,

    CONSTRAINT "contact_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "pageLimit" INTEGER NOT NULL,
    "creationPriceCents" INTEGER NOT NULL,
    "monthlyPriceCents" INTEGER NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "scope" TEXT,
    "exclusions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "planId" UUID,
    "title" TEXT NOT NULL,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'RESEARCHED',
    "planNameSnapshot" TEXT,
    "pageLimitSnapshot" INTEGER,
    "creationPriceCents" INTEGER,
    "monthlyPriceCents" INTEGER,
    "paymentTermsSnapshot" TEXT,
    "scopeSnapshot" TEXT,
    "notes" TEXT,
    "lostReason" TEXT,
    "closedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "opportunityId" UUID,
    "kind" "ActivityKind" NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "result" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE,
    "dueAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "companyId" UUID,
    "opportunityId" UUID,
    "projectId" UUID,
    "serviceId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "opportunityId" UUID,
    "name" TEXT NOT NULL,
    "stage" "ProjectStage" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "planNameSnapshot" TEXT NOT NULL,
    "pageLimit" INTEGER NOT NULL,
    "creationPriceCents" INTEGER NOT NULL,
    "monthlyPriceCents" INTEGER NOT NULL,
    "scope" TEXT,
    "creationPaymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "monthlyPaymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_TRACKED',
    "monthlyDueDay" INTEGER,
    "monthlyStartsOn" DATE,
    "startedOn" DATE,
    "confirmedDeadline" DATE,
    "website" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_checklist_items" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "completedAt" TIMESTAMPTZ(3),
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "projectId" UUID,
    "kind" "ServiceKind" NOT NULL,
    "identifier" TEXT NOT NULL,
    "provider" TEXT,
    "renewalResponsible" "RenewalResponsible" NOT NULL DEFAULT 'ORCK_DEV',
    "dueOn" DATE NOT NULL,
    "priceCents" INTEGER,
    "periodicity" "Periodicity" NOT NULL DEFAULT 'YEARLY',
    "customPeriodDescription" TEXT,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "followUpStatus" "FollowUpStatus" NOT NULL DEFAULT 'NOT_NOTIFIED',
    "notes" TEXT,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_reminder_rules" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_reminder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_notices" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "notifiedAt" TIMESTAMPTZ(3) NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT,
    "clientResponse" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_renewals" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "renewedOn" DATE NOT NULL,
    "previousDueOn" DATE NOT NULL,
    "nextDueOn" DATE NOT NULL,
    "priceCents" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "fileHash" TEXT,
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'REVIEWING',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(3),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_rows" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawData" JSONB NOT NULL,
    "status" "ImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "errors" JSONB,
    "companyId" UUID,
    "resolutionNotes" TEXT,

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "companies_phoneNormalized_idx" ON "companies"("phoneNormalized");

-- CreateIndex
CREATE INDEX "companies_assessment_archivedAt_idx" ON "companies"("assessment", "archivedAt");

-- CreateIndex
CREATE INDEX "contacts_companyId_idx" ON "contacts"("companyId");

-- CreateIndex
CREATE INDEX "research_sources_companyId_idx" ON "research_sources"("companyId");

-- CreateIndex
CREATE INDEX "contact_permissions_companyId_channel_recordedAt_idx" ON "contact_permissions"("companyId", "channel", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE INDEX "opportunities_companyId_idx" ON "opportunities"("companyId");

-- CreateIndex
CREATE INDEX "opportunities_stage_idx" ON "opportunities"("stage");

-- CreateIndex
CREATE INDEX "activities_companyId_occurredAt_idx" ON "activities"("companyId", "occurredAt");

-- CreateIndex
CREATE INDEX "activities_opportunityId_idx" ON "activities"("opportunityId");

-- CreateIndex
CREATE INDEX "tasks_status_dueDate_idx" ON "tasks"("status", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_dueAt_idx" ON "tasks"("dueAt");

-- CreateIndex
CREATE INDEX "tasks_companyId_idx" ON "tasks"("companyId");

-- CreateIndex
CREATE INDEX "tasks_opportunityId_idx" ON "tasks"("opportunityId");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_serviceId_idx" ON "tasks"("serviceId");

-- CreateIndex
CREATE INDEX "projects_companyId_idx" ON "projects"("companyId");

-- CreateIndex
CREATE INDEX "projects_opportunityId_idx" ON "projects"("opportunityId");

-- CreateIndex
CREATE INDEX "projects_stage_idx" ON "projects"("stage");

-- CreateIndex
CREATE INDEX "project_checklist_items_projectId_idx" ON "project_checklist_items"("projectId");

-- CreateIndex
CREATE INDEX "services_companyId_idx" ON "services"("companyId");

-- CreateIndex
CREATE INDEX "services_projectId_idx" ON "services"("projectId");

-- CreateIndex
CREATE INDEX "services_dueOn_archivedAt_idx" ON "services"("dueOn", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "service_reminder_rules_serviceId_daysBefore_key" ON "service_reminder_rules"("serviceId", "daysBefore");

-- CreateIndex
CREATE INDEX "service_notices_serviceId_notifiedAt_idx" ON "service_notices"("serviceId", "notifiedAt");

-- CreateIndex
CREATE INDEX "service_renewals_serviceId_renewedOn_idx" ON "service_renewals"("serviceId", "renewedOn");

-- CreateIndex
CREATE INDEX "import_batches_fileHash_idx" ON "import_batches"("fileHash");

-- CreateIndex
CREATE INDEX "import_rows_companyId_idx" ON "import_rows"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "import_rows_batchId_rowNumber_key" ON "import_rows"("batchId", "rowNumber");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_sources" ADD CONSTRAINT "research_sources_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_permissions" ADD CONSTRAINT "contact_permissions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_checklist_items" ADD CONSTRAINT "project_checklist_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_reminder_rules" ADD CONSTRAINT "service_reminder_rules_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_notices" ADD CONSTRAINT "service_notices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_renewals" ADD CONSTRAINT "service_renewals_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
