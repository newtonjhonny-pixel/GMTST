import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FichaDetailTabs } from './ficha-detail-tabs'

export default async function FichaEpiDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ficha = await prisma.fichaEntregaEPI.findUnique({
    where: { id },
    include: {
      colaborador: true,
      empresa: true,
      unidade: true,
      itens: { include: { epi: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!ficha) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'FICHA_ENTREGA_EPI', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <FichaDetailTabs
      historico={historico.map(h => ({
        id: h.id,
        acao: h.acao,
        descricao: h.descricao,
        createdAt: h.createdAt.toISOString(),
        usuario: h.usuario?.name ?? null,
      }))}
      ficha={{
        id: ficha.id,
        dataEntrega: ficha.dataEntrega.toISOString(),
        observacao: ficha.observacao,
        status: ficha.status,
        colaborador: { id: ficha.colaborador.id, nome: ficha.colaborador.nome, cpf: ficha.colaborador.cpf, matricula: ficha.colaborador.matricula, funcao: ficha.colaborador.funcao, setor: ficha.colaborador.setor },
        empresaId: ficha.empresaId,
        empresa: { razaoSocial: ficha.empresa.razaoSocial },
        unidade: { nome: ficha.unidade.nome, cidade: ficha.unidade.cidade, uf: ficha.unidade.uf },
        itens: ficha.itens.map(i => ({
          id: i.id,
          epiId: i.epiId,
          epiNome: i.epi.nome,
          epiCa: i.epi.ca,
          epiValidade: i.epi.validade ? i.epi.validade.toISOString() : null,
          quantidade: i.quantidade,
          quantidadeDevolvida: i.quantidadeDevolvida,
          dataEntrega: i.dataEntrega.toISOString(),
          dataVencimento: i.dataVencimento ? i.dataVencimento.toISOString() : null,
          observacao: i.observacao,
          ativo: i.ativo,
        })),
      }}
    />
  )
}
