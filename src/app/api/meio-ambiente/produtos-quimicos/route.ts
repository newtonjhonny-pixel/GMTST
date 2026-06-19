import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const produtos = await prisma.produtoQuimico.findMany({
    include: { empresa: true },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(produtos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const produto = await prisma.produtoQuimico.create({
      data: {
        empresaId:  body.empresaId ?? null,
        nome:       body.nome,
        cas:        body.cas ?? null,
        fornecedor: body.fornecedor ?? null,
        fispq:      body.fispq ?? null,
        riscos:     body.riscos ?? [],
        armazenagem: body.armazenagem ?? null,
        epi:        body.epi ?? [],
        observacao: body.observacao ?? null,
      },
    })
    return NextResponse.json(produto, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
