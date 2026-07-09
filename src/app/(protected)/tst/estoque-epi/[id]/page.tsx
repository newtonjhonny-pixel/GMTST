import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EstoqueEpiDetailTabs } from './estoque-detail-tabs'

export default async function EstoqueEpiDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const epi = await prisma.ePI.findUnique({
    where: { id },
    include: { empresa: true },
  })

  if (!epi) notFound()

  const movimentos = await prisma.estoqueEPI.findMany({
    where: { epiId: id },
    include: {
      ficha: { select: { id: true, colaborador: { select: { nome: true } } } },
      usuario: { select: { name: true } },
    },
    orderBy: { dataMovimento: 'desc' },
  })

  const historico = await prisma.historico.findMany({
    where: { entidade: 'EPI', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <EstoqueEpiDetailTabs
      epi={{
        id: epi.id,
        empresaId: epi.empresaId,
        empresa: epi.empresa ? { razaoSocial: epi.empresa.razaoSocial } : null,
        nome: epi.nome,
        ca: epi.ca,
        tipo: epi.tipo,
        validade: epi.validade ? epi.validade.toISOString() : null,
        status: epi.status,
        codigoInterno: epi.codigoInterno,
        codigoBarras: epi.codigoBarras,
        descricao: epi.descricao,
        categoria: epi.categoria,
        fabricante: epi.fabricante,
        modelo: epi.modelo,
        tamanho: epi.tamanho,
        cor: epi.cor,
        unidadeMedida: epi.unidadeMedida,
        quantidadeEstoque: epi.quantidadeEstoque,
        estoqueMinimo: epi.estoqueMinimo,
        localizacao: epi.localizacao,
        fornecedor: epi.fornecedor,
        valorUnitario: epi.valorUnitario,
        lote: epi.lote,
        dataCompra: epi.dataCompra ? epi.dataCompra.toISOString() : null,
        dataEntrada: epi.dataEntrada ? epi.dataEntrada.toISOString() : null,
        observacoes: epi.observacoes,
      }}
      movimentos={movimentos.map(m => ({
        id: m.id, tipo: m.tipo, quantidade: m.quantidade,
        dataMovimento: m.dataMovimento.toISOString(),
        fornecedor: m.fornecedor, notaFiscal: m.notaFiscal, responsavel: m.responsavel,
        motivo: m.motivo, observacao: m.observacao, ativo: m.ativo,
        ficha: m.ficha ? { id: m.ficha.id, colaboradorNome: m.ficha.colaborador.nome } : null,
        usuario: m.usuario?.name ?? null,
      }))}
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
    />
  )
}
