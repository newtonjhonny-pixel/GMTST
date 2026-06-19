import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const taxas = await prisma.taxa.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(taxas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const taxa = await prisma.taxa.create({
      data: {
        tipo:        body.tipo,
        orgao:       body.orgao,
        empresaId:   body.empresaId,
        unidadeId:   body.unidadeId,
        competencia: body.competencia ?? null,
        vencimento:  new Date(body.vencimento),
        valor:       body.valor ? parseFloat(body.valor) : null,
        status:      body.status ?? 'PENDENTE',
        responsavel: body.responsavel ?? null,
        observacao:  body.observacao ?? null,
      },
    })
    return NextResponse.json(taxa, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
