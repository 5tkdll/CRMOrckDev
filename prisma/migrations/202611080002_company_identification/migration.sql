BEGIN;

-- Additive migration: preserves existing companies and related records.
ALTER TABLE "public"."companies"
  ADD COLUMN "documentType" VARCHAR(4),
  ADD COLUMN "documentNumber" VARCHAR(14),
  ADD COLUMN "responsibleName" VARCHAR(200),
  ADD COLUMN "responsibleCpf" VARCHAR(11),
  ADD COLUMN "postalCode" VARCHAR(8),
  ADD COLUMN "addressNumber" VARCHAR(30),
  ADD COLUMN "addressComplement" VARCHAR(200);

CREATE UNIQUE INDEX "companies_documentType_documentNumber_key"
ON "public"."companies"("documentType", "documentNumber");

-- Legacy rows remain NULL. Documents are canonical: no punctuation, CNPJ uppercase.
ALTER TABLE "public"."companies"
ADD CONSTRAINT "companies_document_pair_check" CHECK (
  ("documentType" IS NULL AND "documentNumber" IS NULL)
  OR ("documentType" IS NOT NULL AND "documentNumber" IS NOT NULL AND (
    ("documentType" = 'CPF' AND "documentNumber" ~ '^[0-9]{11}$')
    OR ("documentType" = 'CNPJ' AND "documentNumber" ~ '^[A-Z0-9]{12}[0-9]{2}$')
  ))
),
ADD CONSTRAINT "companies_document_type_check" CHECK ("documentType" IS NULL OR "documentType" IN ('CPF', 'CNPJ')),
ADD CONSTRAINT "companies_responsible_cpf_check" CHECK ("responsibleCpf" IS NULL OR "responsibleCpf" ~ '^[0-9]{11}$'),
ADD CONSTRAINT "companies_postal_code_check" CHECK ("postalCode" IS NULL OR "postalCode" ~ '^[0-9]{8}$');

COMMIT;
