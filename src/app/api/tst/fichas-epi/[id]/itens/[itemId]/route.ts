import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if ((session.user as any).role !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'Somente administradores podem excluir ou inativar itens.' }, { status: 403 })
  }
  const { id, itemId } = await params

  try {
    const item = await prisma.entregaEPI.findUnique({ where: { id: itemId }, include: { epi: true } })
    if (!item || item.fichaId !== id) return NextResponse.json({ error: 'Item não encontrado nesta ficha' }, { status: 404 })

    const body = await req.json()
    const ativo = Boolean(body.ativo)

    const atualizado = await prisma.entregaEPI.update({ where: { id: itemId }, data: { ativo } })

    await prisma.historico.create({
      data: {
        entidade: 'FICHA_ENTREGA_EPI',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: `Item "${item.epi.nome}" ${ativo ? 'reativado' : 'inativado'} por ${(session.user as any).name ?? 'administrador'}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(atualizado)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao atualizar item' }, { status: 400 })
  }
}
