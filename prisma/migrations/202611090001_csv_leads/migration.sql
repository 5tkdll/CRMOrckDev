BEGIN;
CREATE TABLE "public"."csv_batches" (
 "id" UUID NOT NULL, "userId" UUID NOT NULL, "filename" TEXT NOT NULL, "fileHash" TEXT NOT NULL,
 "separator" TEXT NOT NULL, "headers" JSONB NOT NULL, "mapping" JSONB NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'REVIEWING', "totalRows" INTEGER NOT NULL,
 "importedRows" INTEGER NOT NULL DEFAULT 0, "skippedRows" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMPTZ(3),
 CONSTRAINT "csv_batches_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "csv_batches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "csv_batches_status_check" CHECK ("status" IN ('REVIEWING','COMPLETED'))
);
CREATE UNIQUE INDEX "csv_batches_fileHash_key" ON "public"."csv_batches"("fileHash");
CREATE INDEX "csv_batches_userId_createdAt_idx" ON "public"."csv_batches"("userId", "createdAt");
CREATE TABLE "public"."csv_entries" (
 "id" UUID NOT NULL, "batchId" UUID NOT NULL, "line" INTEGER NOT NULL, "raw" JSONB NOT NULL,
 "values" JSONB NOT NULL, "structuralError" TEXT, "status" TEXT NOT NULL DEFAULT 'PENDING',
 "warnings" JSONB NOT NULL, "errors" JSONB NOT NULL, "conflicts" JSONB NOT NULL, "resolution" TEXT,
 CONSTRAINT "csv_entries_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "csv_entries_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."csv_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "csv_entries_batchId_line_key" ON "public"."csv_entries"("batchId", "line");
CREATE TABLE "public"."leads" (
 "id" UUID NOT NULL, "entryId" UUID NOT NULL, "name" TEXT NOT NULL,
 "phoneOriginal" TEXT, "phoneNormalized" TEXT, "instagram" TEXT, "instagramUrl" TEXT,
 "website" TEXT, "websiteUrl" TEXT, "websiteDomain" TEXT, "websiteKind" TEXT NOT NULL,
 "location" TEXT, "segment" TEXT, "googleRating" DOUBLE PRECISION, "sourceUrl" TEXT,
 "researchedAt" TEXT, "notes" TEXT, "needsResearch" BOOLEAN NOT NULL DEFAULT false,
 "doNotContact" BOOLEAN NOT NULL DEFAULT false, "doNotContactReason" TEXT,
 "assessment" TEXT NOT NULL DEFAULT 'UNREVIEWED',
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
 CONSTRAINT "leads_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "leads_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."csv_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "leads_entryId_key" ON "public"."leads"("entryId");
CREATE INDEX "leads_name_idx" ON "public"."leads"("name");
CREATE INDEX "leads_phoneNormalized_idx" ON "public"."leads"("phoneNormalized");
CREATE INDEX "leads_websiteDomain_idx" ON "public"."leads"("websiteDomain");
CREATE INDEX "leads_needsResearch_idx" ON "public"."leads"("needsResearch");
REVOKE ALL PRIVILEGES ON "public"."csv_batches", "public"."csv_entries", "public"."leads" FROM crmapp;
GRANT SELECT, INSERT, UPDATE ON "public"."csv_batches", "public"."csv_entries", "public"."leads" TO crmapp;
COMMIT;
