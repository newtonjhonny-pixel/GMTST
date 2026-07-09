import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { editarUsuarioSchema } from '@/lib/validations/usuario'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params
  const usuario = await prisma.user.findUnique({
    where: { id },
    include: { perfil: true, empresa: true, unidade: true },
  })
  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  const { password: _senha, ...usuarioSemSenha } = usuario
  return NextResponse.json(usuarioSemSenha)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const parsed = editarUsuarioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const data = parsed.data

    const atual = await prisma.user.findUnique({ where: { id } })
    if (!atual) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    if (data.email !== atual.email) {
      const emailEmUso = await prisma.user.findUnique({ where: { email: data.email } })
      if (emailEmUso) {
        return NextResponse.json({ error: 'Já existe um usuário cadastrado com este e-mail' }, { status: 409 })
      }
    }

    const perfil = await prisma.perfil.findUnique({ where: { id: data.perfilId } })
    if (!perfil) {
      return NextResponse.json({ error: 'Perfil selecionado não encontrado' }, { status: 400 })
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        perfilId: data.perfilId,
        empresaId: data.empresaId || null,
        unidadeId: data.unidadeId || null,
        ativo: data.ativo,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'USUARIO',
        entidadeId: usuario.id,
        acao: 'ATUALIZAR',
        descricao: `Dados do usuário "${usuario.name}" atualizados`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    const { password: _senha, ...usuarioSemSenha } = usuario
    return NextResponse.json(usuarioSemSenha)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao atualizar usuário' }, { status: 400 })
  }
}
