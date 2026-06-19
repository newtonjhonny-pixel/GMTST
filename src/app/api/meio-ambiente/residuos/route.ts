import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const residuos = await prisma.controleResiduo.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataGeracao: 'desc' },
  })
  return NextResponse.json(residuos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const residuo = await prisma.controleResiduo.create({
      data: {
        empresaId:      body.empresaId ?? null,
        unidadeId:      body.unidadeId ?? null,
        descricao:      body.descricao,
        codigoIBAMA:    body.codigoIBAMA ?? null,
        classeRisco:    body.classeRisco ?? null,
        quantidade:     parseFloat(body.quantidade),
        unidadeMedida:  body.unidadeMedida,
        dataGeracao:    new Date(body.dataGeracao),
        destinacao:     body.destinacao,
        empresaColetora: body.empresaColetora ?? null,
        mtr:            body.mtr ?? null,
        certificadoDest: body.certificadoDest ?? null,
        observacao:     body.observacao ?? null,
      },
    })
    return NextResponse.json(residuo, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
