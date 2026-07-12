-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "cityServiceCode" TEXT,
ADD COLUMN     "nfeioCompanyId" TEXT;

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "emissaoAutomatica" BOOLEAN NOT NULL DEFAULT false;
