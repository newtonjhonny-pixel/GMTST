-- AlterTable
ALTER TABLE "EPI" ADD COLUMN "empresaId" TEXT,
ADD COLUMN "codigoInterno" TEXT,
ADD COLUMN "codigoBarras" TEXT,
ADD COLUMN "descricao" TEXT,
ADD COLUMN "categoria" TEXT,
ADD COLUMN "fabricante" TEXT,
ADD COLUMN "modelo" TEXT,
ADD COLUMN "tamanho" TEXT,
ADD COLUMN "cor" TEXT,
ADD COLUMN "unidadeMedida" TEXT DEFAULT 'UN',
ADD COLUMN "quantidadeEstoque" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "localizacao" TEXT,
ADD COLUMN "fornecedor" TEXT,
ADD COLUMN "valorUnitario" DOUBLE PRECISION,
ADD COLUMN "lote" TEXT,
ADD COLUMN "dataCompra" TIMESTAMP(3),
ADD COLUMN "dataEntrada" TIMESTAMP(3),
ADD COLUMN "observacoes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EPI_empresaId_ca_key" ON "EPI"("empresaId", "ca");

-- AddForeignKey
ALTER TABLE "EPI" ADD CONSTRAINT "EPI_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;