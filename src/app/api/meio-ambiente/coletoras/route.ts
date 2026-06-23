import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const coletoras = await prisma.empresaColetora.findMany({ orderBy: { razaoSocial: 'asc' } })
  return NextResponse.json(coletoras)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const coletora = await prisma.empresaColetora.create({
      data: {
        razaoSocial:      body.razaoSocial,
        cnpj:             body.cnpj || null,
        telefone:         body.telefone || null,
        email:            body.email || null,
        responsavel:      body.responsavel || null,
        licencaAmbiental: body.licencaAmbiental || null,
        validadeLicenca:  body.validadeLicenca ? new Date(body.validadeLicenca) : null,
        tiposResiduos:    body.tiposResiduos ?? [],
        status:           body.status ?? 'ATIVO',
        observacao:       body.observacao || null,
      },
    })
    return NextResponse.json(coletora, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
