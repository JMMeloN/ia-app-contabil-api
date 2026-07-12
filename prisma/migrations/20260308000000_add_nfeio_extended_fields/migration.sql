-- AlterTable companies: campos NFe.io estendidos
ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "nomeFantasia"               TEXT,
  ADD COLUMN IF NOT EXISTS "rua"                        TEXT,
  ADD COLUMN IF NOT EXISTS "numero"                     TEXT,
  ADD COLUMN IF NOT EXISTS "bairro"                     TEXT,
  ADD COLUMN IF NOT EXISTS "complemento"                TEXT,
  ADD COLUMN IF NOT EXISTS "dataAbertura"               TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "regimeTributario"           TEXT,
  ADD COLUMN IF NOT EXISTS "naturezaJuridica"           TEXT,
  ADD COLUMN IF NOT EXISTS "inscricaoMunicipal"         TEXT,
  ADD COLUMN IF NOT EXISTS "inscricaoEstadual"          TEXT,
  ADD COLUMN IF NOT EXISTS "regimeEspecialTributacao"   TEXT,
  ADD COLUMN IF NOT EXISTS "numeroJuntaComercial"       BIGINT,
  ADD COLUMN IF NOT EXISTS "rpsSerie"                   TEXT,
  ADD COLUMN IF NOT EXISTS "rpsNumero"                  BIGINT,
  ADD COLUMN IF NOT EXISTS "aliquotaIss"                DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "determinacaoImpostoFederal" TEXT,
  ADD COLUMN IF NOT EXISTS "determinacaoImpostoMunicipal" TEXT,
  ADD COLUMN IF NOT EXISTS "prefeituraLogin"            TEXT,
  ADD COLUMN IF NOT EXISTS "prefeituraSenha"            TEXT,
  ADD COLUMN IF NOT EXISTS "valorAutorizacao"           TEXT,
  ADD COLUMN IF NOT EXISTS "statusFiscal"               TEXT,
  ADD COLUMN IF NOT EXISTS "ambiente"                   TEXT DEFAULT 'Development';

-- Unique index para nfeioCompanyId (se ainda não existir)
CREATE UNIQUE INDEX IF NOT EXISTS "companies_nfeioCompanyId_key" ON "companies"("nfeioCompanyId");

-- AlterTable requests: campos tomador e NFe.io
ALTER TABLE "requests"
  ADD COLUMN IF NOT EXISTS "tomadorNome"      TEXT,
  ADD COLUMN IF NOT EXISTS "tomadorDocumento" TEXT,
  ADD COLUMN IF NOT EXISTS "tomadorEmail"     TEXT,
  ADD COLUMN IF NOT EXISTS "nfeioInvoiceId"   TEXT;
