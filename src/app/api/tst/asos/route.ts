import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const asos = await prisma.aSO.findMany({
    include: { colaborador: { include: { unidade: { include: { empresa: true } } } } },
    orderBy: { dataExame: 'desc' },
  })
  return NextResponse.json(asos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const aso = await prisma.aSO.create({
      data: {
        colaboradorId:  body.colaboradorId,
        tipo:           body.tipo,
        dataExame:      new Date(body.dataExame),
        dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
        resultado:      body.resultado ?? 'APTO',
        medico:         body.medico || null,
        crm:            body.crm || null,
        observacao:     body.observacao || null,
      },
    })
    return NextResponse.json(aso, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
