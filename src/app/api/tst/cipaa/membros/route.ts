import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const cipaId = req.nextUrl.searchParams.get('cipaId')
  const membros = await prisma.membroCipaa.findMany({
    where: cipaId ? { cipaId } : undefined,
    include: { colaborador: true, cipa: { include: { empresa: true, unidade: true } } },
    orderBy: { cargo: 'asc' },
  })
  return NextResponse.json(membros)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const membro = await prisma.membroCipaa.create({
      data: {
        cipaId:        body.cipaId,
        colaboradorId: body.colaboradorId,
        cargo:         body.cargo,
        representacao: body.representacao,
        dataPosse:     body.dataPosse ? new Date(body.dataPosse) : null,
        status:        body.status ?? 'ATIVO',
      },
    })
    return NextResponse.json(membro, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
