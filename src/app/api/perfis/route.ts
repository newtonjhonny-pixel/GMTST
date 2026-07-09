import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { perfilSchema } from '@/lib/validations/usuario'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const perfis = await prisma.perfil.findMany({
    include: { _count: { select: { usuarios: true } } },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(perfis)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = perfilSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const data = parsed.data

    const existente = await prisma.perfil.findUnique({ where: { nome: data.nome } })
    if (existente) {
      return NextResponse.json({ error: 'Já existe um perfil com este nome' }, { status: 409 })
    }

    const perfil = await prisma.perfil.create({
      data: {
        nome: data.nome,
        descricao: data.descricao || null,
        permissoes: data.permissoes,
        ativo: data.ativo,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'PERFIL',
        entidadeId: perfil.id,
        acao: 'CRIAR',
        descricao: `Perfil "${perfil.nome}" criado com ${data.permissoes.length} permissão(ões)`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(perfil, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao criar perfil' }, { status: 400 })
  }
}
