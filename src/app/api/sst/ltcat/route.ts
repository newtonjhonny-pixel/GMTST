import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const ltcats = await prisma.lTCAT.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(ltcats)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const ltcat = await prisma.lTCAT.create({
      data: {
        empresaId:          body.empresaId,
        unidadeId:          body.unidadeId,
        responsavelTecnico: body.responsavelTecnico,
        crea:               body.crea ?? null,
        art:                body.art ?? null,
        dataEmissao:        new Date(body.dataEmissao),
        vigencia:           body.vigencia ? new Date(body.vigencia) : null,
        ambientesAvaliados: body.ambientesAvaliados ?? null,
        agentesNocivos:     body.agentesNocivos ?? [],
        status:             body.status ?? 'VIGENTE',
        observacao:         body.observacao ?? null,
      },
    })
    return NextResponse.json(ltcat, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
