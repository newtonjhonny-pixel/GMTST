import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const ficha = await prisma.fichaEntregaEPI.findUnique({
    where: { id },
    include: {
      colaborador: { include: { unidade: { include: { empresa: true } } } },
      empresa: true,
      unidade: true,
      itens: { include: { epi: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!ficha) return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
  return NextResponse.json(ficha)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const atual = await prisma.fichaEntregaEPI.findUnique({ where: { id } })
    if (!atual) return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })

    const ficha = await prisma.fichaEntregaEPI.update({
      where: { id },
      data: {
        dataEntrega: body.dataEntrega ? new Date(body.dataEntrega) : undefined,
        observacao: body.observacao !== undefined ? (body.observacao || null) : undefined,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'FICHA_ENTREGA_EPI',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: 'Dados gerais da ficha de entrega atualizados',
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(ficha)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao atualizar ficha' }, { status: 400 })
  }
}
