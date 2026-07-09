import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const ficha = await prisma.fichaEntregaEPI.findUnique({ where: { id } })
    if (!ficha) return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
    if (ficha.status === 'INATIVA') {
      return NextResponse.json({ error: 'Não é possível adicionar itens a uma ficha inativada.' }, { status: 400 })
    }

    const body = await req.json()
    if (!body.epiId || !body.dataEntrega) {
      return NextResponse.json({ error: 'EPI e data de entrega são obrigatórios.' }, { status: 400 })
    }
    const quantidade = body.quantidade ? parseInt(body.quantidade) : 1

    const item = await prisma.$transaction(async (tx) => {
      const epi = await tx.ePI.findUnique({ where: { id: body.epiId } })
      if (!epi) throw new Error('EPI informado não existe.')
      if (epi.quantidadeEstoque < quantidade) {
        throw Object.assign(new Error('Quantidade insuficiente em estoque.'), { code: 'ESTOQUE_INSUFICIENTE' })
      }

      const novoItem = await tx.entregaEPI.create({
        data: {
          fichaId: id,
          colaboradorId: ficha.colaboradorId,
          epiId: body.epiId,
          dataEntrega: new Date(body.dataEntrega),
          dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
          quantidade,
          observacao: body.observacao || null,
        },
        include: { epi: true },
      })

      await tx.ePI.update({ where: { id: epi.id }, data: { quantidadeEstoque: { decrement: quantidade } } })

      if (epi.empresaId) {
        await tx.estoqueEPI.create({
          data: {
            epiId: epi.id,
            empresaId: epi.empresaId,
            tipo: 'SAIDA',
            quantidade,
            dataMovimento: new Date(body.dataEntrega),
            motivo: 'Entrega ao colaborador',
            fichaId: id,
            entregaEpiId: novoItem.id,
            usuarioId: (session.user as any).id ?? null,
          },
        })
      }

      return novoItem
    })

    await prisma.historico.create({
      data: {
        entidade: 'FICHA_ENTREGA_EPI',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: `Item "${item.epi.nome}" adicionado à ficha`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2003') return NextResponse.json({ error: 'EPI informado não existe.' }, { status: 400 })
    return NextResponse.json({ error: err.message ?? 'Erro ao adicionar item' }, { status: 400 })
  }
}
