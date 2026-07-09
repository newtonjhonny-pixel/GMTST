import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { perfilSchema } from '@/lib/validations/usuario'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params
  const perfil = await prisma.perfil.findUnique({
    where: { id },
    include: { _count: { select: { usuarios: true } } },
  })
  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  return NextResponse.json(perfil)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const parsed = perfilSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 })
    }
    const data = parsed.data

    const atual = await prisma.perfil.findUnique({ where: { id } })
    if (!atual) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

    if (data.nome !== atual.nome) {
      const nomeEmUso = await prisma.perfil.findUnique({ where: { nome: data.nome } })
      if (nomeEmUso) {
        return NextResponse.json({ error: 'Já existe um perfil com este nome' }, { status: 409 })
      }
    }

    const perfil = await prisma.perfil.update({
      where: { id },
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
        acao: 'ATUALIZAR',
        descricao: `Perfil "${perfil.nome}" atualizado (${data.permissoes.length} permissão(ões))`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(perfil)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao atualizar perfil' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const perfil = await prisma.perfil.findUnique({
    where: { id },
    include: { _count: { select: { usuarios: true } } },
  })
  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  if (perfil._count.usuarios > 0) {
    return NextResponse.json(
      { error: `Não é possível excluir: ${perfil._count.usuarios} usuário(s) vinculado(s) a este perfil` },
      { status: 409 }
    )
  }

  await prisma.perfil.delete({ where: { id } })

  await prisma.historico.create({
    data: {
      entidade: 'PERFIL',
      entidadeId: id,
      acao: 'EXCLUIR',
      descricao: `Perfil "${perfil.nome}" excluído`,
      usuarioId: (session.user as any).id ?? null,
    },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
