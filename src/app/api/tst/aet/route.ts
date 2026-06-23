import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const aets = await prisma.aET.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataEmissao: 'desc' },
  })
  return NextResponse.json(aets)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const aet = await prisma.aET.create({
      data: {
        empresaId:          body.empresaId,
        unidadeId:          body.unidadeId,
        responsavelTecnico: body.responsavelTecnico,
        crea:               body.crea || null,
        art:                body.art || null,
        dataEmissao:        new Date(body.dataEmissao),
        vigencia:           body.vigencia ? new Date(body.vigencia) : null,
        setoresAvaliados:   body.setoresAvaliados || null,
        atividades:         Array.isArray(body.atividades) ? body.atividades : [],
        fatoresErgonomicos: Array.isArray(body.fatoresErgonomicos) ? body.fatoresErgonomicos : [],
        status:             body.status ?? 'VIGENTE',
        observacao:         body.observacao || null,
        anexos:             Array.isArray(body.anexos) ? body.anexos : [],
      },
    })
    return NextResponse.json(aet, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
