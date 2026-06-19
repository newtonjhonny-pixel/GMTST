import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const pendencias = await prisma.pendencia.findMany({
    include: { empresa: true, unidade: true, responsavel: { select: { id: true, name: true } } },
    orderBy: [{ prioridade: 'desc' }, { prazo: 'asc' }],
  })
  return NextResponse.json(pendencias)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const pendencia = await prisma.pendencia.create({
      data: {
        descricao:     body.descricao,
        origem:        body.origem,
        empresaId:     body.empresaId,
        unidadeId:     body.unidadeId ?? null,
        responsavelId: body.responsavelId ?? null,
        prazo:         new Date(body.prazo),
        prioridade:    body.prioridade ?? 'MEDIA',
        status:        body.status ?? 'ABERTA',
        observacao:    body.observacao ?? null,
      },
    })
    return NextResponse.json(pendencia, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
