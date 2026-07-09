import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PgrDetailTabs } from './pgr-detail-tabs'

export default async function PgrDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pgr = await prisma.pGR.findUnique({
    where: { id },
    include: {
      empresa: true,
      unidade: true,
      revisoes: { orderBy: { dataRevisao: 'desc' } },
    },
  })

  if (!pgr) notFound()

  return (
    <PgrDetailTabs
      pgr={{
        id: pgr.id,
        versao: pgr.versao,
        status: pgr.status,
        dataEmissao: pgr.dataEmissao.toISOString(),
        dataRevisao: pgr.dataRevisao ? pgr.dataRevisao.toISOString() : null,
        responsavelTecnico: pgr.responsavelTecnico,
        crea: pgr.crea,
        observacao: pgr.observacao,
        empresa: { razaoSocial: pgr.empresa.razaoSocial },
        unidade: { nome: pgr.unidade.nome, cidade: pgr.unidade.cidade, uf: pgr.unidade.uf },
        revisoes: pgr.revisoes.map(r => ({
          id: r.id,
          versao: r.versao,
          dataRevisao: r.dataRevisao.toISOString(),
          descricao: r.descricao,
        })),
      }}
    />
  )
}
