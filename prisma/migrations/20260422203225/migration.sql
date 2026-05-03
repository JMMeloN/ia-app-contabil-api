-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'OPERACIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDENTE', 'PROCESSADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "complemento" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "cep" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3),
    "regimeTributario" TEXT,
    "naturezaJuridica" TEXT,
    "inscricaoMunicipal" TEXT,
    "inscricaoEstadual" TEXT,
    "userId" TEXT NOT NULL,
    "regimeEspecialTributacao" TEXT,
    "numeroJuntaComercial" BIGINT,
    "rpsSerie" TEXT,
    "rpsNumero" BIGINT,
    "aliquotaIss" DOUBLE PRECISION,
    "determinacaoImpostoFederal" TEXT,
    "determinacaoImpostoMunicipal" TEXT,
    "prefeituraLogin" TEXT,
    "prefeituraSenha" TEXT,
    "valorAutorizacao" TEXT,
    "nfeioCompanyId" TEXT,
    "cityServiceCode" TEXT,
    "statusFiscal" TEXT,
    "ambiente" TEXT DEFAULT 'Development',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDENTE',
    "arquivoUrl" TEXT,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "payerId" TEXT,
    "tomadorNome" TEXT,
    "tomadorDocumento" TEXT,
    "tomadorEmail" TEXT,
    "nfeioInvoiceId" TEXT,
    "processadoEm" TIMESTAMP(3),
    "emissaoAutomatica" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_nfeioCompanyId_key" ON "companies"("nfeioCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_cnpj_key" ON "companies"("userId", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "payers_userId_document_key" ON "payers"("userId", "document");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payers" ADD CONSTRAINT "payers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
