-- DropIndex
DROP INDEX IF EXISTS "companies_cnpj_key";

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_cnpj_key" ON "companies"("userId", "cnpj");
