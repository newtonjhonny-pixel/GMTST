import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const cipaas = await prisma.cipaa.findMany({
    include: { empresa: true, unidade: true, membros: true, reunioes: true },
    orderBy: { mandatoInicio: 'desc' },
  })
  return NextResponse.json(cipaas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const cipa = await prisma.cipaa.create({
      data: {
        empresaId:    body.empresaId,
        unidadeId:    body.unidadeId,
        mandatoInicio: new Date(body.mandatoInicio),
        mandatoFim:    new Date(body.mandatoFim),
        numeroEdital:  body.numeroEdital || null,
        status:        body.status ?? 'ATIVO',
        observacao:    body.observacao || null,
      },
    })
    return NextResponse.json(cipa, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
