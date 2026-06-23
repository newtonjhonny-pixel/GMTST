import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const certs = await prisma.certificadoDestinacao.findMany({
    include: { empresa: true, coletor: true },
    orderBy: { dataEmissao: 'desc' },
  })
  return NextResponse.json(certs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const cert = await prisma.certificadoDestinacao.create({
      data: {
        empresaId:       body.empresaId,
        coletorId:       body.coletorId,
        numero:          body.numero || null,
        dataEmissao:     new Date(body.dataEmissao),
        dataVencimento:  body.dataVencimento ? new Date(body.dataVencimento) : null,
        tiposResiduos:   body.tiposResiduos ?? [],
        quantidadeTotal: body.quantidadeTotal ? parseFloat(body.quantidadeTotal) : null,
        unidadeMedida:   body.unidadeMedida || null,
        formaDestinacao: body.formaDestinacao || null,
        observacao:      body.observacao || null,
      },
    })
    return NextResponse.json(cert, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
