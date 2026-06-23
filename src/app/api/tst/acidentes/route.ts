import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const acidentes = await prisma.acidente.findMany({
    include: { empresa: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(acidentes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const acidente = await prisma.acidente.create({
      data: {
        empresaId:        body.empresaId,
        data:             new Date(body.data),
        local:            body.local,
        descricao:        body.descricao,
        tipologia:        body.tipologia,
        cat:              body.cat === true || body.cat === 'true',
        numeroCat:        body.numeroCat || null,
        dataCat:          body.dataCat ? new Date(body.dataCat) : null,
        eSocial:          body.eSocial === true || body.eSocial === 'true',
        eSocialProtocolo: body.eSocialProtocolo || null,
        diasPerdidos:     body.diasPerdidos ? parseInt(body.diasPerdidos) : null,
        investigacao:     body.investigacao || null,
        planoAcao:        body.planoAcao || null,
        status:           body.status ?? 'ABERTO',
      },
    })
    return NextResponse.json(acidente, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
