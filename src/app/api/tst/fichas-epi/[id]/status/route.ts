import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if ((session.user as any).role !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'Somente administradores podem excluir ou inativar a ficha.' }, { status: 403 })
  }
  const { id } = await params

  try {
    const ficha = await prisma.fichaEntregaEPI.findUnique({ where: { id }, include: { colaborador: true } })
    if (!ficha) return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })

    const body = await req.json()
    const status = body.status === 'ATIVA' ? 'ATIVA' : 'INATIVA'

    const atualizada = await prisma.fichaEntregaEPI.update({ where: { id }, data: { status } })

    await prisma.historico.create({
      data: {
        entidade: 'FICHA_ENTREGA_EPI',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: `Ficha de "${ficha.colaborador.nome}" ${status === 'ATIVA' ? 'reativada' : 'inativada'} por ${(session.user as any).name ?? 'administrador'}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(atualizada)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao atualizar status da ficha' }, { status: 400 })
  }
}
