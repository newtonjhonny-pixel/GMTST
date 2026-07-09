import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')
  const empresas = await prisma.empresa.findMany({
    where: all ? undefined : { status: 'ATIVO' },
    select: { id: true, razaoSocial: true, cnpj: true, codigo: true },
    orderBy: { razaoSocial: 'asc' },
  })
  return NextResponse.json(empresas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()

    if (!body.codigo || !body.razaoSocial || !body.cnpj) {
      return NextResponse.json({ error: 'Código, razão social e CNPJ são obrigatórios.' }, { status: 400 })
    }

    const cnpjLimpo = String(body.cnpj).replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) {
      return NextResponse.json({ error: 'CNPJ inválido. Informe os 14 dígitos.' }, { status: 400 })
    }

    const empresa = await prisma.empresa.create({
      data: {
        codigo:      body.codigo,
        razaoSocial: body.razaoSocial,
        cnpj:        cnpjLimpo,
        status:      body.status ?? 'ATIVO',
      },
    })
    return NextResponse.json(empresa, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : err?.meta?.target
      return NextResponse.json({ error: `Já existe uma empresa cadastrada com este ${target ?? 'código/CNPJ'}.` }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
