import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const avcb = await prisma.aVCB.findUnique({
    where: { id },
    include: { empresa: true, unidade: true },
  })
  if (!avcb) return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
  return NextResponse.json(avcb)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.numero !== undefined) data.numero = body.numero
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.orgaoEmissor !== undefined) data.orgaoEmissor = body.orgaoEmissor
    if (body.dataEmissao !== undefined) data.dataEmissao = body.dataEmissao ? new Date(body.dataEmissao) : null
    if (body.dataValidade !== undefined) data.dataValidade = new Date(body.dataValidade)
    if (body.areaProtegida !== undefined) data.areaProtegida = body.areaProtegida ? parseFloat(body.areaProtegida) : null
    if (body.responsavelTecnico !== undefined) data.responsavelTecnico = body.responsavelTecnico || null
    if (body.crea !== undefined) data.crea = body.crea || null
    if (body.status !== undefined) data.status = body.status
    if (body.observacao !== undefined) data.observacao = body.observacao || null

    const avcb = await prisma.aVCB.update({ where: { id }, data })

    await prisma.historico.create({
      data: {
        entidade: 'AVCB',
        entidadeId: avcb.id,
        acao: 'ATUALIZAR',
        descricao: `${avcb.tipo} nº ${avcb.numero} atualizado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(avcb)
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
