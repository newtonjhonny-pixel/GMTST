import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProdutoQuimicoDetailTabs } from './produto-detail-tabs'

export default async function ProdutoQuimicoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = await prisma.produtoQuimico.findUnique({
    where: { id },
    include: { empresa: true },
  })

  if (!produto) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'PRODUTO_QUIMICO', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <ProdutoQuimicoDetailTabs
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
      produto={{
        id: produto.id,
        nome: produto.nome,
        cas: produto.cas,
        fornecedor: produto.fornecedor,
        fispq: produto.fispq,
        riscos: produto.riscos,
        armazenagem: produto.armazenagem,
        epi: produto.epi,
        observacao: produto.observacao,
        empresa: produto.empresa ? { razaoSocial: produto.empresa.razaoSocial } : null,
      }}
    />
  )
}
