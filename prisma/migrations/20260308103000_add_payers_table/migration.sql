-- CreateTable
CREATE TABLE IF NOT EXISTS "payers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payers_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "payerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payers_userId_document_key" ON "payers"("userId", "document");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payers_userId_fkey'
  ) THEN
    ALTER TABLE "payers"
      ADD CONSTRAINT "payers_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'requests_payerId_fkey'
  ) THEN
    ALTER TABLE "requests"
      ADD CONSTRAINT "requests_payerId_fkey"
      FOREIGN KEY ("payerId") REFERENCES "payers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
