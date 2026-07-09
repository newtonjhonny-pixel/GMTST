-- CreateEnum
CREATE TYPE "SituacaoResiduo" AS ENUM ('GERADO', 'AGUARDANDO_COLETA', 'COLETADO', 'DESTINADO');

-- CreateEnum
CREATE TYPE "StatusAnexo" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "TipoAVCB" AS ENUM ('AVCB', 'CLCB');

-- CreateEnum
CREATE TYPE "StatusSimulado" AS ENUM ('PENDENTE', 'REALIZADO', 'CANCELADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MaterialColetaSeletiva" ADD VALUE 'MADEIRA';
ALTER TYPE "MaterialColetaSeletiva" ADD VALUE 'PILHAS';
ALTER TYPE "MaterialColetaSeletiva" ADD VALUE 'LAMPADAS';

-- AlterTable
ALTER TABLE "ControleResiduo" ADD COLUMN     "classificacao" TEXT,
ADD COLUMN     "coletorId" TEXT,
ADD COLUMN     "dataColeta" TIMESTAMP(3),
ADD COLUMN     "dataDestinacao" TIMESTAMP(3),
ADD COLUMN     "formaArmazenamento" TEXT,
ADD COLUMN     "origem" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "responsavel" TEXT,
ADD COLUMN     "setorGerador" TEXT,
ADD COLUMN     "situacao" "SituacaoResiduo" NOT NULL DEFAULT 'GERADO',
ADD COLUMN     "tipoResiduo" TEXT;

-- AlterTable
ALTER TABLE "EmpresaColetora" ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "numeroLicenca" TEXT;

-- AlterTable
ALTER TABLE "CertificadoDestinacao" ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "responsavel" TEXT,
ADD COLUMN     "unidadeId" TEXT;

-- AlterTable
ALTER TABLE "ColetaSeletiva" ADD COLUMN     "frequencia" TEXT,
ADD COLUMN     "local" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "responsavel" TEXT;

-- CreateTable
CREATE TABLE "DocumentoAnexo" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "arquivoNome" TEXT NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "usuarioId" TEXT,
    "observacao" TEXT,
    "status" "StatusAnexo" NOT NULL DEFAULT 'ATIVO',
    "versao" INTEGER NOT NULL DEFAULT 1,
    "substituiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoAnexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AVCB" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoAVCB" NOT NULL DEFAULT 'AVCB',
    "orgaoEmissor" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "areaProtegida" DOUBLE PRECISION,
    "responsavelTecnico" TEXT,
    "crea" TEXT,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AVCB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrigadaIncendio" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "qtdMembros" INTEGER,
    "dataTreinamento" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrigadaIncendio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimuladoIncendio" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "dataPrevista" TIMESTAMP(3),
    "dataRealizacao" TIMESTAMP(3),
    "participantes" INTEGER,
    "status" "StatusSimulado" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimuladoIncendio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentoAnexo_entidade_entidadeId_idx" ON "DocumentoAnexo"("entidade", "entidadeId");

-- AddForeignKey
ALTER TABLE "ControleResiduo" ADD CONSTRAINT "ControleResiduo_coletorId_fkey" FOREIGN KEY ("coletorId") REFERENCES "EmpresaColetora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoDestinacao" ADD CONSTRAINT "CertificadoDestinacao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAnexo" ADD CONSTRAINT "DocumentoAnexo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAnexo" ADD CONSTRAINT "DocumentoAnexo_substituiId_fkey" FOREIGN KEY ("substituiId") REFERENCES "DocumentoAnexo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AVCB" ADD CONSTRAINT "AVCB_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AVCB" ADD CONSTRAINT "AVCB_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrigadaIncendio" ADD CONSTRAINT "BrigadaIncendio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrigadaIncendio" ADD CONSTRAINT "BrigadaIncendio_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimuladoIncendio" ADD CONSTRAINT "SimuladoIncendio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimuladoIncendio" ADD CONSTRAINT "SimuladoIncendio_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
