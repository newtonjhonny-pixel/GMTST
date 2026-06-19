import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const ppps = await prisma.pPP.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(ppps)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const ppp = await prisma.pPP.create({
      data: {
        colaboradorId:  body.colaboradorId,
        empresaId:      body.empresaId,
        unidadeId:      body.unidadeId,
        dataEmissao:    new Date(body.dataEmissao),
        historico:      body.historico ?? null,
        agentesNocivos: body.agentesNocivos ?? [],
        responsavel:    body.responsavel ?? null,
        observacao:     body.observacao ?? null,
      },
    })
    return NextResponse.json(ppp, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
