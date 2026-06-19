import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const itens = await prisma.monitoramentoAmbiental.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataColeta: 'desc' },
  })
  return NextResponse.json(itens)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const item = await prisma.monitoramentoAmbiental.create({
      data: {
        empresaId:      body.empresaId,
        unidadeId:      body.unidadeId,
        tipo:           body.tipo,
        parametro:      body.parametro,
        resultado:      body.resultado ?? null,
        unidadeMedida:  body.unidadeMedida ?? null,
        limitePermitido: body.limitePermitido ?? null,
        conformidade:   body.conformidade !== undefined ? body.conformidade : null,
        dataColeta:     new Date(body.dataColeta),
        dataProxima:    body.dataProxima ? new Date(body.dataProxima) : null,
        laboratorio:    body.laboratorio ?? null,
        responsavel:    body.responsavel ?? null,
        observacao:     body.observacao ?? null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
