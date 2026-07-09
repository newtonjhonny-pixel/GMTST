import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { alterarSenhaSchema } from '@/lib/validations/usuario'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const parsed = alterarSenhaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }

    const usuario = await prisma.user.findUnique({ where: { id } })
    if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const hash = await bcrypt.hash(parsed.data.password, 12)
    await prisma.user.update({ where: { id }, data: { password: hash } })

    await prisma.historico.create({
      data: {
        entidade: 'USUARIO',
        entidadeId: id,
        acao: 'ATUALIZAR',
        descricao: `Senha do usuário "${usuario.name}" alterada`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao alterar senha' }, { status: 400 })
  }
}
