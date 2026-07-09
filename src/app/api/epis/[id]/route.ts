import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const epi = await prisma.ePI.findUnique({
    where: { id },
    include: { empresa: { select: { razaoSocial: true } } },
  })
  if (!epi) return NextResponse.json({ error: 'EPI não encontrado' }, { status: 404 })
  return NextResponse.json(epi)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  try {
    const existente = await prisma.ePI.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ error: 'EPI não encontrado' }, { status: 404 })

    const body = await req.json()
    if (!body.nome || !body.ca || !body.tipo) {
      return NextResponse.json({ error: 'Nome, CA e tipo são obrigatórios.' }, { status: 400 })
    }

    const epi = await prisma.ePI.update({
      where: { id },
      data: {
        empresaId:      body.empresaId || null,
        nome:           body.nome,
        ca:             body.ca,
        tipo:           body.tipo,
        validade:       body.validade ? new Date(body.validade) : null,
        codigoInterno:  body.codigoInterno || null,
        codigoBarras:   body.codigoBarras || null,
        descricao:      body.descricao || null,
        categoria:      body.categoria || null,
        fabricante:     body.fabricante || null,
        modelo:         body.modelo || null,
        tamanho:        body.tamanho || null,
        cor:            body.cor || null,
        unidadeMedida:  body.unidadeMedida || 'UN',
        estoqueMinimo:  body.estoqueMinimo !== undefined ? parseInt(body.estoqueMinimo) : existente.estoqueMinimo,
        localizacao:    body.localizacao || null,
        fornecedor:     body.fornecedor || null,
        valorUnitario:  body.valorUnitario ? parseFloat(body.valorUnitario) : null,
        lote:           body.lote || null,
        dataCompra:     body.dataCompra ? new Date(body.dataCompra) : null,
        dataEntrada:    body.dataEntrada ? new Date(body.dataEntrada) : null,
        observacoes:    body.observacoes || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'EPI',
        entidadeId: epi.id,
        acao: 'ATUALIZAR',
        descricao: `Cadastro do EPI "${epi.nome}" (CA ${epi.ca}) atualizado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(epi)
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Já existe um EPI cadastrado com este número de CA para esta empresa.' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if ((session.user as any).role !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'Somente administradores podem excluir ou restaurar EPIs.' }, { status: 403 })
  }
  const { id } = await params

  try {
    const existente = await prisma.ePI.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ error: 'EPI não encontrado' }, { status: 404 })

    const body = await req.json()
    const novoStatus = body.status === 'ATIVO' ? 'ATIVO' : 'ARQUIVADO'

    const epi = await prisma.ePI.update({ where: { id }, data: { status: novoStatus } })

    await prisma.historico.create({
      data: {
        entidade: 'EPI',
        entidadeId: epi.id,
        acao: novoStatus === 'ARQUIVADO' ? 'EXCLUIR' : 'ATUALIZAR',
        descricao: `EPI "${epi.nome}" (CA ${epi.ca}) ${novoStatus === 'ARQUIVADO' ? 'excluído logicamente' : 'restaurado'} por ${(session.user as any).name ?? 'administrador'}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(epi)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
