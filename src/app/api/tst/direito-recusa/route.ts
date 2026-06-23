import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const registros = await prisma.direitoRecusa.findMany({
    include: { empresa: true, colaborador: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const dr = await prisma.direitoRecusa.create({
      data: {
        empresaId:     body.empresaId,
        colaboradorId: body.colaboradorId,
        data:          new Date(body.data),
        descricaoRisco:body.descricaoRisco,
        motivoRecusa:  body.motivoRecusa,
        providencias:  body.providencias || null,
        responsavel:   body.responsavel || null,
        resolvido:     body.resolvido === true || body.resolvido === 'true',
      },
    })
    return NextResponse.json(dr, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
