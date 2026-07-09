import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const fichas = await prisma.fichaEntregaEPI.findMany({
    include: {
      colaborador: true,
      empresa: true,
      unidade: true,
      itens: { where: { ativo: true }, include: { epi: true } },
    },
    orderBy: { dataEntrega: 'desc' },
  })

  return NextResponse.json(fichas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const { empresaId, unidadeId, colaboradorId, dataEntrega, observacao, itens } = body

    if (!empresaId || !unidadeId || !colaboradorId || !dataEntrega) {
      return NextResponse.json({ error: 'Empresa, unidade, colaborador e data de entrega são obrigatórios.' }, { status: 400 })
    }
    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ error: 'Adicione ao menos um item de EPI à ficha.' }, { status: 400 })
    }
    for (const item of itens) {
      if (!item.epiId || !item.dataEntrega) {
        return NextResponse.json({ error: 'Cada item deve ter EPI e data de entrega.' }, { status: 400 })
      }
    }

    const ficha = await prisma.$transaction(async (tx) => {
      const novaFicha = await tx.fichaEntregaEPI.create({
        data: {
          empresaId, unidadeId, colaboradorId,
          dataEntrega: new Date(dataEntrega),
          observacao: observacao || null,
        },
      })

      for (const item of itens) {
        const quantidade = item.quantidade ? parseInt(item.quantidade) : 1

        const epi = await tx.ePI.findUnique({ where: { id: item.epiId } })
        if (!epi) throw new Error('EPI informado não existe.')
        if (epi.quantidadeEstoque < quantidade) {
          throw Object.assign(new Error('Quantidade insuficiente em estoque.'), { code: 'ESTOQUE_INSUFICIENTE', epiNome: epi.nome })
        }

        const entrega = await tx.entregaEPI.create({
          data: {
            fichaId: novaFicha.id,
            colaboradorId,
            epiId: item.epiId,
            dataEntrega: new Date(item.dataEntrega || dataEntrega),
            dataVencimento: item.dataVencimento ? new Date(item.dataVencimento) : null,
            quantidade,
            observacao: item.observacao || null,
          },
        })

        await tx.ePI.update({ where: { id: epi.id }, data: { quantidadeEstoque: { decrement: quantidade } } })

        if (epi.empresaId) {
          await tx.estoqueEPI.create({
            data: {
              epiId: epi.id,
              empresaId: epi.empresaId,
              tipo: 'SAIDA',
              quantidade,
              dataMovimento: new Date(item.dataEntrega || dataEntrega),
              motivo: 'Entrega ao colaborador',
              fichaId: novaFicha.id,
              entregaEpiId: entrega.id,
              usuarioId: (session.user as any).id ?? null,
            },
          })
        }
      }

      return novaFicha
    })

    const colaborador = await prisma.colaborador.findUnique({ where: { id: colaboradorId } })

    await prisma.historico.create({
      data: {
        entidade: 'FICHA_ENTREGA_EPI',
        entidadeId: ficha.id,
        acao: 'CRIAR',
        descricao: `Ficha de entrega de EPI criada para "${colaborador?.nome ?? colaboradorId}" com ${itens.length} item(ns)`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(ficha, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2003') return NextResponse.json({ error: 'Empresa, unidade, colaborador ou EPI informado não existe.' }, { status: 400 })
    return NextResponse.json({ error: err.message ?? 'Erro ao criar ficha de entrega' }, { status: 400 })
  }
}
