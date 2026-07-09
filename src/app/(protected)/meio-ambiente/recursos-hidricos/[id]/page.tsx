import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { RecursoHidricoDetailTabs } from './recurso-detail-tabs'

export default async function RecursoHidricoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recurso = await prisma.recursoHidrico.findUnique({
    where: { id },
    include: { empresa: true, unidade: true },
  })

  if (!recurso) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'RECURSO_HIDRICO', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <RecursoHidricoDetailTabs
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
      recurso={{
        id: recurso.id,
        tipo: recurso.tipo,
        numeroOutorga: recurso.numeroOutorga,
        orgaoOtorgante: recurso.orgaoOtorgante,
        emissao: recurso.emissao ? recurso.emissao.toISOString() : null,
        vencimento: recurso.vencimento ? recurso.vencimento.toISOString() : null,
        vazaoAutorizada: recurso.vazaoAutorizada,
        unidadeMedida: recurso.unidadeMedida,
        finalidade: recurso.finalidade,
        responsavel: recurso.responsavel,
        status: recurso.status,
        observacao: recurso.observacao,
        empresa: { razaoSocial: recurso.empresa.razaoSocial },
        unidade: { nome: recurso.unidade.nome, cidade: recurso.unidade.cidade, uf: recurso.unidade.uf },
      }}
    />
  )
}
