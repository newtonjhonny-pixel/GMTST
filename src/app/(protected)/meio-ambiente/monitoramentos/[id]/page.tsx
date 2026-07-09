import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MonitoramentoDetailTabs } from './monitoramento-detail-tabs'

export default async function MonitoramentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.monitoramentoAmbiental.findUnique({
    where: { id },
    include: { empresa: true, unidade: true },
  })

  if (!item) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'MONITORAMENTO_AMBIENTAL', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <MonitoramentoDetailTabs
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
      item={{
        id: item.id,
        tipo: item.tipo,
        parametro: item.parametro,
        resultado: item.resultado,
        unidadeMedida: item.unidadeMedida,
        limitePermitido: item.limitePermitido,
        conformidade: item.conformidade,
        dataColeta: item.dataColeta.toISOString(),
        dataProxima: item.dataProxima ? item.dataProxima.toISOString() : null,
        laboratorio: item.laboratorio,
        responsavel: item.responsavel,
        observacao: item.observacao,
        empresa: { razaoSocial: item.empresa.razaoSocial },
        unidade: { nome: item.unidade.nome, cidade: item.unidade.cidade, uf: item.unidade.uf },
      }}
    />
  )
}
