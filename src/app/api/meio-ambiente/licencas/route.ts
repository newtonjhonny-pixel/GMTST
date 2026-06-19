import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const licencas = await prisma.licencaAmbiental.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(licencas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const licenca = await prisma.licencaAmbiental.create({
      data: {
        empresaId:   body.empresaId,
        unidadeId:   body.unidadeId,
        tipo:        body.tipo,
        orgao:       body.orgao,
        numero:      body.numero ?? null,
        emissao:     body.emissao ? new Date(body.emissao) : null,
        vencimento:  new Date(body.vencimento),
        responsavel: body.responsavel ?? null,
        condicionantes: body.condicionantes ?? null,
        status:      body.status ?? 'VIGENTE',
      },
    })
    return NextResponse.json(licenca, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
