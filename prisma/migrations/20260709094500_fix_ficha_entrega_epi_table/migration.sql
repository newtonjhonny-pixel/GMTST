-- CreateEnum
CREATE TYPE "StatusFichaEPI" AS ENUM ('ATIVA', 'INATIVA');

-- CreateTable
CREATE TABLE "FichaEntregaEPI" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "status" "StatusFichaEPI" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FichaEntregaEPI_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FichaEntregaEPI" ADD CONSTRAINT "FichaEntregaEPI_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaEntregaEPI" ADD CONSTRAINT "FichaEntregaEPI_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaEntregaEPI" ADD CONSTRAINT "FichaEntregaEPI_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;