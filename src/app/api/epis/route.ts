import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')
  const all = searchParams.get('all')

  const epis = await prisma.ePI.findMany({
    where: {
      ...(empresaId ? { empresaId } : {}),
      ...(all ? {} : { status: 'ATIVO' }),
    },
    orderBy: { nome: 'asc' },
    include: { empresa: { select: { razaoSocial: true } } },
  })
  return NextResponse.json(epis)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    if (!body.nome || !body.ca || !body.tipo) {
      return NextResponse.json({ error: 'Nome, CA e tipo são obrigatórios.' }, { status: 400 })
    }

    const quantidadeInicial = body.quantidadeEstoque ? parseInt(body.quantidadeEstoque) : 0

    const epi = await prisma.$transaction(async (tx) => {
      const novoEpi = await tx.ePI.create({
        data: {
          empresaId:         body.empresaId || null,
          nome:              body.nome,
          ca:                body.ca,
          tipo:              body.tipo,
          validade:          body.validade ? new Date(body.validade) : null,
          status:            body.status ?? 'ATIVO',
          codigoInterno:     body.codigoInterno || null,
          codigoBarras:      body.codigoBarras || null,
          descricao:         body.descricao || null,
          categoria:         body.categoria || null,
          fabricante:        body.fabricante || null,
          modelo:            body.modelo || null,
          tamanho:           body.tamanho || null,
          cor:               body.cor || null,
          unidadeMedida:     body.unidadeMedida || 'UN',
          quantidadeEstoque: quantidadeInicial,
          estoqueMinimo:     body.estoqueMinimo ? parseInt(body.estoqueMinimo) : 0,
          localizacao:       body.localizacao || null,
          fornecedor:        body.fornecedor || null,
          valorUnitario:     body.valorUnitario ? parseFloat(body.valorUnitario) : null,
          lote:              body.lote || null,
          dataCompra:        body.dataCompra ? new Date(body.dataCompra) : null,
          dataEntrada:       body.dataEntrada ? new Date(body.dataEntrada) : null,
          observacoes:       body.observacoes || null,
        },
      })

      if (quantidadeInicial > 0 && novoEpi.empresaId) {
        await tx.estoqueEPI.create({
          data: {
            epiId: novoEpi.id,
            empresaId: novoEpi.empresaId,
            tipo: 'ENTRADA',
            quantidade: quantidadeInicial,
            dataMovimento: new Date(),
            motivo: 'Estoque inicial do cadastro',
            usuarioId: (session.user as any).id ?? null,
          },
        })
      }

      return novoEpi
    })

    await prisma.historico.create({
      data: {
        entidade: 'EPI',
        entidadeId: epi.id,
        acao: 'CRIAR',
        descricao: `EPI "${epi.nome}" (CA ${epi.ca}) cadastrado no estoque`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(epi, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Já existe um EPI cadastrado com este número de CA para esta empresa.' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
