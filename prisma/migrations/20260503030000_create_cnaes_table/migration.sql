-- CreateTable
CREATE TABLE "cnaes" (
    "id" TEXT NOT NULL,
    "codCnae" TEXT NOT NULL,
    "descricaoCnae" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cnaes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cnaes_codCnae_key" ON "cnaes"("codCnae");

-- CheckConstraint: codCnae deve conter apenas números
ALTER TABLE "cnaes" ADD CONSTRAINT "cnaes_codCnae_numeric_check" CHECK ("codCnae" ~ '^[0-9]+$');
