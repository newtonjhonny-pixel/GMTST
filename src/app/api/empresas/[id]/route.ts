import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      unidades: { orderBy: { nome: 'asc' }, include: { _count: { select: { colaboradores: true } } } },
      _count: { select: { pendencias: true, certificacoes: true, taxas: true, documentosLegais: true } },
    },
  })

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  return NextResponse.json(empresa)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.codigo !== undefined) data.codigo = body.codigo
    if (body.razaoSocial !== undefined) data.razaoSocial = body.razaoSocial
    if (body.cnpj !== undefined) data.cnpj = String(body.cnpj).replace(/\D/g, '')
    if (body.status !== undefined) data.status = body.status

    const empresa = await prisma.empresa.update({ where: { id }, data })
    return NextResponse.json(empresa)
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Código ou CNPJ já cadastrado em outra empresa.' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
