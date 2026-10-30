-- Campos tributários do ISSNet-DF (ISS retido, tributação nacional, descontos, deduções e retenções federais)
ALTER TABLE "invoice_requests"
  ADD COLUMN "federal_service_code" TEXT,
  ADD COLUMN "taxation_type" TEXT,
  ADD COLUMN "iss_withheld" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "iss_amount_withheld" DOUBLE PRECISION,
  ADD COLUMN "deductions_amount" DOUBLE PRECISION,
  ADD COLUMN "unconditioned_discount_amount" DOUBLE PRECISION,
  ADD COLUMN "conditioned_discount_amount" DOUBLE PRECISION,
  ADD COLUMN "ir_amount_withheld" DOUBLE PRECISION,
  ADD COLUMN "pis_amount_withheld" DOUBLE PRECISION,
  ADD COLUMN "cofins_amount_withheld" DOUBLE PRECISION,
  ADD COLUMN "csll_amount_withheld" DOUBLE PRECISION,
  ADD COLUMN "inss_amount_withheld" DOUBLE PRECISION;
