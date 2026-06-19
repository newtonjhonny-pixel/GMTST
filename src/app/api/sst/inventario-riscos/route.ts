import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const itens = await prisma.inventarioRisco.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(itens)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const item = await prisma.inventarioRisco.create({
      data: {
        empresaId:        body.empresaId,
        unidadeId:        body.unidadeId,
        pgrId:            body.pgrId ?? null,
        ghe:              body.ghe,
        atividade:        body.atividade,
        agente:           body.agente,
        tipoRisco:        body.tipoRisco,
        fontePorVia:      body.fontePorVia ?? null,
        nivelAcao:        body.nivelAcao ?? null,
        limiteTolerancia: body.limiteTolerancia ?? null,
        medicaoRealizada: body.medicaoRealizada ?? null,
        medidasControle:  body.medidasControle ?? null,
        epc:              body.epc ?? null,
        epi:              body.epi ?? null,
        responsavel:      body.responsavel ?? null,
        status:           body.status ?? 'IDENTIFICADO',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
