import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const equips = await prisma.equipamentoPressao.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { proximaInspecao: 'asc' },
  })
  return NextResponse.json(equips)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const eq = await prisma.equipamentoPressao.create({
      data: {
        empresaId:          body.empresaId,
        unidadeId:          body.unidadeId,
        tipo:               body.tipo,
        tag:                body.tag,
        fabricante:         body.fabricante || null,
        modelo:             body.modelo || null,
        numeroSerie:        body.numeroSerie || null,
        pressaoMaxima:      body.pressaoMaxima ? parseFloat(body.pressaoMaxima) : null,
        volumeInterno:      body.volumeInterno ? parseFloat(body.volumeInterno) : null,
        fluido:             body.fluido || null,
        localizacao:        body.localizacao || null,
        dataFabricacao:     body.dataFabricacao ? new Date(body.dataFabricacao) : null,
        ultimaInspecao:     body.ultimaInspecao ? new Date(body.ultimaInspecao) : null,
        proximaInspecao:    body.proximaInspecao ? new Date(body.proximaInspecao) : null,
        art:                body.art || null,
        responsavelTecnico: body.responsavelTecnico || null,
        status:             body.status ?? 'ATIVO',
        observacao:         body.observacao || null,
      },
    })
    return NextResponse.json(eq, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
