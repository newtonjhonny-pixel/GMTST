import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const recursos = await prisma.recursoHidrico.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(recursos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const recurso = await prisma.recursoHidrico.create({
      data: {
        empresaId:       body.empresaId,
        unidadeId:       body.unidadeId,
        tipo:            body.tipo,
        numeroOutorga:   body.numeroOutorga || null,
        orgaoOtorgante:  body.orgaoOtorgante || null,
        emissao:         body.emissao ? new Date(body.emissao) : null,
        vencimento:      body.vencimento ? new Date(body.vencimento) : null,
        vazaoAutorizada: body.vazaoAutorizada ? parseFloat(body.vazaoAutorizada) : null,
        unidadeMedida:   body.unidadeMedida || null,
        finalidade:      body.finalidade || null,
        responsavel:     body.responsavel || null,
        status:          body.status ?? 'ATIVO',
        observacao:      body.observacao || null,
      },
    })
    return NextResponse.json(recurso, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
