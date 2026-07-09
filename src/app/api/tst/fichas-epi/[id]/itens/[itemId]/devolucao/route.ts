import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id, itemId } = await params

  try {
    const body = await req.json()
    const quantidade = body.quantidade ? parseInt(body.quantidade) : 0
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      return NextResponse.json({ error: 'Informe uma quantidade válida para devolução.' }, { status: 400 })
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const item = await tx.entregaEPI.findUnique({ where: { id: itemId }, include: { epi: true } })
      if (!item || item.fichaId !== id) throw new Error('Item não encontrado nesta ficha')

      const disponivelParaDevolucao = item.quantidade - item.quantidadeDevolvida
      if (quantidade > disponivelParaDevolucao) {
        throw Object.assign(new Error(`Quantidade maior que o disponível para devolução (${disponivelParaDevolucao}).`), { code: 'DEVOLUCAO_INVALIDA' })
      }

      const itemAtualizado = await tx.entregaEPI.update({
        where: { id: itemId },
        data: { quantidadeDevolvida: { increment: quantidade } },
      })

      await tx.ePI.update({ where: { id: item.epiId }, data: { quantidadeEstoque: { increment: quantidade } } })

      if (item.epi.empresaId) {
        await tx.estoqueEPI.create({
          data: {
            epiId: item.epiId,
            empresaId: item.epi.empresaId,
            tipo: 'DEVOLUCAO',
            quantidade,
            dataMovimento: new Date(),
            motivo: body.motivo || 'Devolução do colaborador',
            fichaId: id,
            entregaEpiId: itemId,
            usuarioId: (session.user as any).id ?? null,
          },
        })
      }

      return { item: itemAtualizado, epiNome: item.epi.nome }
    })

    await prisma.historico.create({
      data: {
        entidade: 'FICHA_ENTREGA_EPI',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: `Devolução de ${quantidade} un. de "${resultado.epiNome}" registrada`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(resultado.item)
  } catch (err: any) {
    if (err?.code === 'DEVOLUCAO_INVALIDA') return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: err.message ?? 'Erro ao registrar devolução' }, { status: 400 })
  }
}
