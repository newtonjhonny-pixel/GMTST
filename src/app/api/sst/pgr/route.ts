import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unidadeId = searchParams.get('unidadeId')

  const pgrs = await prisma.pGR.findMany({
    where: unidadeId ? { unidadeId } : undefined,
    select: { id: true, versao: true, unidadeId: true },
    orderBy: { dataEmissao: 'desc' },
  })
  return NextResponse.json(pgrs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const pgr = await prisma.pGR.create({
      data: {
        empresaId:          body.empresaId,
        unidadeId:          body.unidadeId,
        versao:             body.versao,
        dataEmissao:        new Date(body.dataEmissao),
        dataRevisao:        body.dataRevisao ? new Date(body.dataRevisao) : null,
        responsavelTecnico: body.responsavelTecnico,
        crea:               body.crea ?? null,
        status:             body.status ?? 'VIGENTE',
        observacao:         body.observacao ?? null,
      },
    })
    return NextResponse.json(pgr, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
