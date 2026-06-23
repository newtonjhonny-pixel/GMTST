import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const registros = await prisma.coletaSeletiva.findMany({
    include: { empresa: true, unidade: true, coletor: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const reg = await prisma.coletaSeletiva.create({
      data: {
        empresaId:    body.empresaId,
        unidadeId:    body.unidadeId,
        data:         new Date(body.data),
        material:     body.material,
        quantidade:   parseFloat(body.quantidade),
        unidadeMedida: body.unidadeMedida || 'kg',
        destinacao:   body.destinacao || null,
        coletorId:    body.coletorId || null,
        observacao:   body.observacao || null,
      },
    })
    return NextResponse.json(reg, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
