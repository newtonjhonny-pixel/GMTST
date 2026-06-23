import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const comunicacoes = await prisma.comunicacaoSST.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(comunicacoes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const com = await prisma.comunicacaoSST.create({
      data: {
        empresaId:    body.empresaId,
        unidadeId:    body.unidadeId || null,
        tipo:         body.tipo,
        titulo:       body.titulo,
        data:         new Date(body.data),
        local:        body.local || null,
        responsavel:  body.responsavel || null,
        duracao:      body.duracao ? parseInt(body.duracao) : null,
        participantes:body.participantes ? parseInt(body.participantes) : null,
        conteudo:     body.conteudo || null,
        anexo:        body.anexo || null,
      },
    })
    return NextResponse.json(com, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
