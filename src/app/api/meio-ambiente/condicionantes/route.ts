import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const licencaId = searchParams.get('licencaId')
  const itens = await prisma.condicionante.findMany({
    where: licencaId ? { licencaId } : undefined,
    include: { licenca: { include: { empresa: true, unidade: true } } },
    orderBy: { prazo: 'asc' },
  })
  return NextResponse.json(itens)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const item = await prisma.condicionante.create({
      data: {
        licencaId:    body.licencaId,
        descricao:    body.descricao,
        prazo:        body.prazo ? new Date(body.prazo) : null,
        periodicidade: body.periodicidade ?? null,
        responsavel:  body.responsavel ?? null,
        evidencia:    body.evidencia ?? null,
        status:       body.status ?? 'PENDENTE',
        observacao:   body.observacao ?? null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
