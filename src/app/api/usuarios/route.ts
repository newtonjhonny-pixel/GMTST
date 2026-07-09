import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { criarUsuarioSchema } from '@/lib/validations/usuario'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const usuarios = await prisma.user.findMany({
    where: { ativo: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(usuarios)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = criarUsuarioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const data = parsed.data

    const existente = await prisma.user.findUnique({ where: { email: data.email } })
    if (existente) {
      return NextResponse.json({ error: 'Já existe um usuário cadastrado com este e-mail' }, { status: 409 })
    }

    const perfil = await prisma.perfil.findUnique({ where: { id: data.perfilId } })
    if (!perfil) {
      return NextResponse.json({ error: 'Perfil selecionado não encontrado' }, { status: 400 })
    }

    const hash = await bcrypt.hash(data.password, 12)

    const usuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
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
        acao: 'CRIAR',
        descricao: `Usuário "${usuario.name}" (${usuario.email}) cadastrado com perfil "${perfil.nome}"`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    const { password: _senha, ...usuarioSemSenha } = usuario
    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao criar usuário' }, { status: 400 })
  }
}
