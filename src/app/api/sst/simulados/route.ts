import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const simulados = await prisma.simuladoIncendio.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataPrevista: 'asc' },
  })
  return NextResponse.json(simulados)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const simulado = await prisma.simuladoIncendio.create({
      data: {
        empresaId:      body.empresaId,
        unidadeId:      body.unidadeId,
        dataPrevista:   body.dataPrevista ? new Date(body.dataPrevista) : null,
        dataRealizacao: body.dataRealizacao ? new Date(body.dataRealizacao) : null,
        participantes:  body.participantes ? parseInt(body.participantes) : null,
        status:         body.status ?? 'PENDENTE',
        observacao:     body.observacao || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'SIMULADO',
        entidadeId: simulado.id,
        acao: 'CRIAR',
        descricao: `Simulado de incêndio cadastrado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(simulado, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
