import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const ordens = await prisma.ordemServico.findMany({
    include: {
      empresa: true,
      unidade: true,
      colaborador: true,
    },
    orderBy: { dataEmissao: 'desc' },
  })
  return NextResponse.json(ordens)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const os = await prisma.ordemServico.create({
      data: {
        numero:          body.numero,
        empresaId:       body.empresaId,
        unidadeId:       body.unidadeId,
        colaboradorId:   body.colaboradorId || null,
        setor:           body.setor || null,
        funcao:          body.funcao || null,
        riscos:          Array.isArray(body.riscos) ? body.riscos : [],
        epis:            Array.isArray(body.epis) ? body.epis : [],
        medidasControle: body.medidasControle || null,
        dataEmissao:     new Date(body.dataEmissao),
        dataRevisao:     body.dataRevisao ? new Date(body.dataRevisao) : null,
        responsavel:     body.responsavel || null,
        assinado:        body.assinado === true || body.assinado === 'true',
        observacao:      body.observacao || null,
        status:          body.status ?? 'ATIVO',
      },
    })
    return NextResponse.json(os, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
