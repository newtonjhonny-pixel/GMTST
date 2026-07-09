import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CondicionanteDetailTabs } from './condicionante-detail-tabs'

export default async function CondicionanteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const condicionante = await prisma.condicionante.findUnique({
    where: { id },
    include: { licenca: { include: { empresa: true, unidade: true } } },
  })

  if (!condicionante) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'CONDICIONANTE', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <CondicionanteDetailTabs
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
      condicionante={{
        id: condicionante.id,
        descricao: condicionante.descricao,
        prazo: condicionante.prazo ? condicionante.prazo.toISOString() : null,
        periodicidade: condicionante.periodicidade,
        responsavel: condicionante.responsavel,
        evidencia: condicionante.evidencia,
        status: condicionante.status,
        observacao: condicionante.observacao,
        licenca: {
          tipo: condicionante.licenca.tipo,
          orgao: condicionante.licenca.orgao,
          empresa: { razaoSocial: condicionante.licenca.empresa.razaoSocial },
          unidade: { nome: condicionante.licenca.unidade.nome, cidade: condicionante.licenca.unidade.cidade, uf: condicionante.licenca.unidade.uf },
        },
      }}
    />
  )
}
