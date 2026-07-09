import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const brigadas = await prisma.brigadaIncendio.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataValidade: 'asc' },
  })
  return NextResponse.json(brigadas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const brigada = await prisma.brigadaIncendio.create({
      data: {
        empresaId:       body.empresaId,
        unidadeId:       body.unidadeId,
        responsavel:     body.responsavel,
        qtdMembros:      body.qtdMembros ? parseInt(body.qtdMembros) : null,
        dataTreinamento: body.dataTreinamento ? new Date(body.dataTreinamento) : null,
        dataValidade:    new Date(body.dataValidade),
        status:          body.status ?? 'ATIVO',
        observacao:      body.observacao || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'BRIGADA',
        entidadeId: brigada.id,
        acao: 'CRIAR',
        descricao: `Brigada de Incêndio cadastrada — responsável ${brigada.responsavel}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(brigada, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
