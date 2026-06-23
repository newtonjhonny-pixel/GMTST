import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const extintores = await prisma.extintor.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { proximaInspecao: 'asc' },
  })
  return NextResponse.json(extintores)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const ext = await prisma.extintor.create({
      data: {
        empresaId:       body.empresaId,
        unidadeId:       body.unidadeId,
        codigo:          body.codigo,
        tipo:            body.tipo,
        capacidade:      body.capacidade,
        localizacao:     body.localizacao,
        setor:           body.setor || null,
        fabricacao:      body.fabricacao ? new Date(body.fabricacao) : null,
        ultimaRecarga:   body.ultimaRecarga ? new Date(body.ultimaRecarga) : null,
        proximaRecarga:  new Date(body.proximaRecarga),
        ultimaInspecao:  body.ultimaInspecao ? new Date(body.ultimaInspecao) : null,
        proximaInspecao: new Date(body.proximaInspecao),
        status:          body.status ?? 'ATIVO',
        observacao:      body.observacao || null,
      },
    })
    return NextResponse.json(ext, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
