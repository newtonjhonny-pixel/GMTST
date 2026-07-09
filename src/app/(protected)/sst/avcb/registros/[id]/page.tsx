import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { AvcbDetailTabs } from './avcb-detail-tabs'

export default async function AvcbDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const avcb = await prisma.aVCB.findUnique({
    where: { id },
    include: { empresa: true, unidade: true },
  })

  if (!avcb) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'AVCB', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AvcbDetailTabs
      historico={historico.map(h => ({
        id: h.id,
        acao: h.acao,
        descricao: h.descricao,
        createdAt: h.createdAt.toISOString(),
        usuario: h.usuario?.name ?? null,
      }))}
      avcb={{
        id: avcb.id,
        numero: avcb.numero,
        tipo: avcb.tipo,
        orgaoEmissor: avcb.orgaoEmissor,
        dataEmissao: avcb.dataEmissao ? avcb.dataEmissao.toISOString() : null,
        dataValidade: avcb.dataValidade.toISOString(),
        areaProtegida: avcb.areaProtegida,
        responsavelTecnico: avcb.responsavelTecnico,
        crea: avcb.crea,
        status: avcb.status,
        observacao: avcb.observacao,
        empresa: { razaoSocial: avcb.empresa.razaoSocial },
        unidade: { nome: avcb.unidade.nome, cidade: avcb.unidade.cidade, uf: avcb.unidade.uf },
      }}
    />
  )
}
