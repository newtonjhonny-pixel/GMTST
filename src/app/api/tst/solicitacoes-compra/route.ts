import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const solicitacoes = await prisma.solicitacaoCompraEPI.findMany({
    include: { empresa: true, epi: true },
    orderBy: { dataSolicitacao: 'desc' },
  })
  return NextResponse.json(solicitacoes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const sol = await prisma.solicitacaoCompraEPI.create({
      data: {
        empresaId:       body.empresaId,
        epiId:           body.epiId || null,
        descricaoEPI:    body.descricaoEPI,
        quantidade:      parseInt(body.quantidade),
        justificativa:   body.justificativa || null,
        solicitante:     body.solicitante,
        dataSolicitacao: new Date(body.dataSolicitacao),
        prazoNecessario: body.prazoNecessario ? new Date(body.prazoNecessario) : null,
        status:          body.status ?? 'ABERTA',
        observacao:      body.observacao || null,
      },
    })
    return NextResponse.json(sol, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
