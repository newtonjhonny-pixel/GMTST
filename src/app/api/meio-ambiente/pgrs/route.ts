import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const pgrs = await prisma.pGRSAmbiental.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataVigencia: 'desc' },
  })
  return NextResponse.json(pgrs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const pgrs = await prisma.pGRSAmbiental.create({
      data: {
        empresaId:      body.empresaId,
        unidadeId:      body.unidadeId,
        versao:         body.versao,
        dataElaboracao: new Date(body.dataElaboracao),
        dataVigencia:   new Date(body.dataVigencia),
        dataRevisao:    body.dataRevisao ? new Date(body.dataRevisao) : null,
        responsavel:    body.responsavel || null,
        consultor:      body.consultor || null,
        status:         body.status ?? 'ATIVO',
        observacao:     body.observacao || null,
      },
    })
    return NextResponse.json(pgrs, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
