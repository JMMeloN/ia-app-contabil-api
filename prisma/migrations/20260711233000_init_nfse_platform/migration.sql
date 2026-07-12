-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'OPERACIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'PROCESSADA', 'FALHA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('LEGAL_ENTITY', 'NATURAL_PERSON');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "federal_tax_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_address" TEXT,
    "street" TEXT,
    "street_number" TEXT,
    "district" TEXT,
    "additional_information" TEXT,
    "city_name" TEXT NOT NULL,
    "city_code" TEXT,
    "state_code" VARCHAR(2) NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country_code" TEXT DEFAULT 'BRA',
    "openning_date" TIMESTAMP(3),
    "tax_regime" TEXT,
    "legal_nature" TEXT,
    "municipal_tax_number" TEXT,
    "regional_tax_number" TEXT,
    "user_id" TEXT NOT NULL,
    "special_tax_regime" TEXT,
    "company_registry_number" BIGINT,
    "rps_serial_number" TEXT,
    "rps_number" BIGINT,
    "iss_rate" DOUBLE PRECISION,
    "federal_tax_determination" TEXT,
    "municipal_tax_determination" TEXT,
    "city_hall_login" TEXT,
    "city_hall_password" TEXT,
    "authorization_issue_value" TEXT,
    "default_city_service_code" TEXT,
    "certificate_thumbprint" TEXT,
    "certificate_expires_at" TIMESTAMP(3),
    "certificate_status" TEXT,
    "nfeio_company_id" TEXT,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "fiscal_status" TEXT,
    "environment" TEXT DEFAULT 'Development',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_takers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "federal_tax_number" TEXT NOT NULL,
    "person_type" "PayerType" NOT NULL DEFAULT 'LEGAL_ENTITY',
    "email" TEXT,
    "phone" TEXT,
    "municipal_tax_number" TEXT,
    "state_tax_number" TEXT,
    "full_address" TEXT,
    "street" TEXT,
    "street_number" TEXT,
    "district" TEXT,
    "additional_information" TEXT,
    "city_name" TEXT,
    "city_code" TEXT,
    "state_code" VARCHAR(2),
    "postal_code" TEXT,
    "country_code" TEXT DEFAULT 'BRA',
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nfeio_payer_id" TEXT,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_takers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_requests" (
    "id" TEXT NOT NULL,
    "services_amount" DOUBLE PRECISION NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "service_description" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDENTE',
    "pdf_url" TEXT,
    "xml_url" TEXT,
    "cancellation_xml_url" TEXT,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "service_taker_id" TEXT NOT NULL,
    "city_service_code" TEXT,
    "invoice_number" TEXT,
    "verification_code" TEXT,
    "error_message" TEXT,
    "external_id" TEXT,
    "borrower_name" TEXT,
    "borrower_document" TEXT,
    "borrower_email" TEXT,
    "borrower_full_address" TEXT,
    "borrower_city_name" TEXT,
    "borrower_state_code" TEXT,
    "borrower_postal_code" TEXT,
    "nfeio_invoice_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "auto_issue" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_nfeio_company_id_key" ON "companies"("nfeio_company_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_user_id_federal_tax_number_key" ON "companies"("user_id", "federal_tax_number");

-- CreateIndex
CREATE INDEX "service_takers_user_id_idx" ON "service_takers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_takers_company_id_federal_tax_number_key" ON "service_takers"("company_id", "federal_tax_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_requests_external_id_key" ON "invoice_requests"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_requests_nfeio_invoice_id_key" ON "invoice_requests"("nfeio_invoice_id");

-- CreateIndex
CREATE INDEX "invoice_requests_user_id_status_idx" ON "invoice_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "invoice_requests_company_id_status_idx" ON "invoice_requests"("company_id", "status");

-- CreateIndex
CREATE INDEX "invoice_requests_service_taker_id_idx" ON "invoice_requests"("service_taker_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key" ON "auth_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_revoked_at_idx" ON "auth_sessions"("user_id", "revoked_at");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_takers" ADD CONSTRAINT "service_takers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_takers" ADD CONSTRAINT "service_takers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_requests" ADD CONSTRAINT "invoice_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_requests" ADD CONSTRAINT "invoice_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_requests" ADD CONSTRAINT "invoice_requests_service_taker_id_fkey" FOREIGN KEY ("service_taker_id") REFERENCES "service_takers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

