import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const ativo = Boolean(body.ativo)

    if (!ativo && (session.user as any).id === id) {
      return NextResponse.json({ error: 'Você não pode desativar seu próprio usuário' }, { status: 400 })
    }

    const usuario = await prisma.user.findUnique({ where: { id } })
    if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const atualizado = await prisma.user.update({ where: { id }, data: { ativo } })

    await prisma.historico.create({
      data: {
        entidade: 'USUARIO',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: `Usuário "${usuario.name}" ${ativo ? 'reativado' : 'desativado'}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    const { password: _senha, ...usuarioSemSenha } = atualizado
    return NextResponse.json(usuarioSemSenha)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao atualizar status' }, { status: 400 })
  }
}
