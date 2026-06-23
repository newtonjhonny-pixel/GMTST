import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const cipaId    = req.nextUrl.searchParams.get('cipaId')
  const empresaId = req.nextUrl.searchParams.get('empresaId')
  const reunioes = await prisma.reuniaoCipaa.findMany({
    where: cipaId ? { cipaId } : empresaId ? { empresaId } : undefined,
    include: { empresa: true, cipa: { include: { unidade: true } } },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(reunioes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const reuniao = await prisma.reuniaoCipaa.create({
      data: {
        cipaId:    body.cipaId,
        empresaId: body.empresaId,
        data:      new Date(body.data),
        tipo:      body.tipo ?? 'ORDINARIA',
        local:     body.local || null,
        pauta:     body.pauta || null,
        ata:       body.ata || null,
        presentes: body.presentes ?? [],
        aprovada:  body.aprovada === true || body.aprovada === 'true',
        observacao: body.observacao || null,
      },
    })
    return NextResponse.json(reuniao, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
