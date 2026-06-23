import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const treinamentos = await prisma.treinamento.findMany({
    include: { empresa: true, unidade: true, _count: { select: { colaboradores: true } } },
    orderBy: { dataRealizacao: 'desc' },
  })
  return NextResponse.json(treinamentos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const t = await prisma.treinamento.create({
      data: {
        nome:                 body.nome,
        tipo:                 body.tipo,
        normaRegulamentadora: body.normaRegulamentadora || null,
        empresaId:            body.empresaId,
        unidadeId:            body.unidadeId,
        dataRealizacao:       new Date(body.dataRealizacao),
        dataVencimento:       body.dataVencimento ? new Date(body.dataVencimento) : null,
        cargaHoraria:         body.cargaHoraria ? parseFloat(body.cargaHoraria) : null,
        instrutor:            body.instrutor || null,
        local:                body.local || null,
        observacao:           body.observacao || null,
        status:               body.status ?? 'ATIVO',
      },
    })
    return NextResponse.json(t, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
