import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')
  const unidades = await prisma.unidade.findMany({
    where: {
      status: 'ATIVO',
      ...(empresaId ? { empresaId } : {}),
    },
    select: { id: true, nome: true, cidade: true, uf: true, empresaId: true },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(unidades)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()

    if (!body.empresaId || !body.nome || !body.cidade || !body.uf) {
      return NextResponse.json({ error: 'Empresa, nome, cidade e UF são obrigatórios.' }, { status: 400 })
    }

    const unidade = await prisma.unidade.create({
      data: {
        empresaId:          body.empresaId,
        nome:               body.nome,
        cidade:             body.cidade,
        uf:                 String(body.uf).toUpperCase(),
        responsavelTST:     body.responsavelTST || null,
        responsavelMeioAmb: body.responsavelMeioAmb || null,
        status:             body.status ?? 'ATIVO',
      },
    })
    return NextResponse.json(unidade, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2003') return NextResponse.json({ error: 'Empresa informada não existe.' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
