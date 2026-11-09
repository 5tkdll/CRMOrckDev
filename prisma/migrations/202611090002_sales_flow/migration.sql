ALTER TYPE "ProjectStage" ADD VALUE IF NOT EXISTS 'READY_TO_PUBLISH';
CREATE TABLE "sales_flows" (
 "id" UUID NOT NULL, "leadId" UUID NOT NULL, "companyId" UUID, "opportunityId" UUID, "projectId" UUID, "taskId" UUID,
 "title" TEXT NOT NULL, "stage" TEXT NOT NULL DEFAULT 'INTERESTED', "version" INTEGER NOT NULL DEFAULT 0,
 "nextAction" TEXT, "nextActionAt" TIMESTAMPTZ(3), "layoutUrl" TEXT, "layoutVersion" TEXT, "layoutApprovedAt" TIMESTAMPTZ(3),
 "planName" TEXT NOT NULL DEFAULT '', "pageLimit" INTEGER NOT NULL DEFAULT 4,
 "creationPriceCents" INTEGER NOT NULL DEFAULT 0, "monthlyPriceCents" INTEGER NOT NULL DEFAULT 0,
 "initialPaymentCents" INTEGER NOT NULL DEFAULT 0, "paidCents" INTEGER NOT NULL DEFAULT 0,
 "paymentTerms" TEXT, "scope" TEXT, "contractConfirmed" BOOLEAN NOT NULL DEFAULT false, "lostReason" TEXT, "notes" TEXT,
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "sales_flows_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "sales_flows_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "sales_flows_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "sales_flows_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "sales_flows_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "sales_flows_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "sales_flows_amounts_check" CHECK ("creationPriceCents">=0 AND "monthlyPriceCents">=0 AND "initialPaymentCents">=0 AND "paidCents">=0 AND "pageLimit">0)
);
CREATE UNIQUE INDEX "sales_flows_opportunityId_key" ON "sales_flows"("opportunityId");
CREATE UNIQUE INDEX "sales_flows_projectId_key" ON "sales_flows"("projectId");
CREATE UNIQUE INDEX "sales_flows_taskId_key" ON "sales_flows"("taskId");
CREATE INDEX "sales_flows_leadId_stage_idx" ON "sales_flows"("leadId","stage");
CREATE INDEX "sales_flows_companyId_idx" ON "sales_flows"("companyId");
CREATE INDEX "sales_flows_stage_nextActionAt_idx" ON "sales_flows"("stage","nextActionAt");
CREATE TABLE "sales_flow_events" (
 "id" UUID NOT NULL, "flowId" UUID NOT NULL, "userId" UUID NOT NULL, "description" TEXT NOT NULL,
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "sales_flow_events_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "sales_flow_events_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "sales_flows"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "sales_flow_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "sales_flow_events_flowId_createdAt_idx" ON "sales_flow_events"("flowId","createdAt");
GRANT SELECT,INSERT,UPDATE ON TABLE "sales_flows","sales_flow_events" TO crmapp;
GRANT SELECT,INSERT,UPDATE ON TABLE "opportunities","projects","tasks","activities" TO crmapp;
