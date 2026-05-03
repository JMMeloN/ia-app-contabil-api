-- CreateTable
CREATE TABLE "nbs" (
    "id" TEXT NOT NULL,
    "nbs" TEXT NOT NULL,
    "descricaoNbs" TEXT NOT NULL,
    "psOnerosa" BOOLEAN,
    "adqExterior" BOOLEAN,
    "indop" TEXT NOT NULL,
    "localIncidencia" TEXT NOT NULL,
    "cClassTrib" TEXT NOT NULL,
    "nomeClassTrib" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nbs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nbs_nbs_key" ON "nbs"("nbs");
