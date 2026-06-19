import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const docs = await prisma.documentoLegal.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const doc = await prisma.documentoLegal.create({
      data: {
        nome:        body.nome,
        tipo:        body.tipo,
        empresaId:   body.empresaId,
        unidadeId:   body.unidadeId,
        emissao:     body.emissao ? new Date(body.emissao) : null,
        vencimento:  body.vencimento ? new Date(body.vencimento) : null,
        responsavel: body.responsavel ?? null,
        status:      body.status ?? 'VIGENTE',
        observacao:  body.observacao ?? null,
      },
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
