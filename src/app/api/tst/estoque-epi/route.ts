import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const TIPOS_MANUAIS = ['ENTRADA', 'SAIDA', 'AJUSTE', 'PERDA', 'BAIXA']

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const epiId = searchParams.get('epiId')
  const all = searchParams.get('all')

  const movimentos = await prisma.estoqueEPI.findMany({
    where: {
      ...(epiId ? { epiId } : {}),
      ...(all ? {} : { ativo: true }),
    },
    include: {
      epi: true, empresa: true,
      ficha: { select: { id: true, colaborador: { select: { nome: true } } } },
      usuario: { select: { name: true } },
    },
    orderBy: { dataMovimento: 'desc' },
  })
  return NextResponse.json(movimentos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const tipo = String(body.tipo || '').toUpperCase()
    if (!TIPOS_MANUAIS.includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de movimento inválido.' }, { status: 400 })
    }
    if (!body.epiId || !body.quantidade || !body.dataMovimento) {
      return NextResponse.json({ error: 'EPI, quantidade e data do movimento são obrigatórios.' }, { status: 400 })
    }

    const quantidade = parseInt(body.quantidade)
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      return NextResponse.json({ error: 'Quantidade deve ser maior que zero.' }, { status: 400 })
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const epi = await tx.ePI.findUnique({ where: { id: body.epiId } })
      if (!epi) throw new Error('EPI não encontrado.')

      let novoSaldo: number
      if (tipo === 'ENTRADA') novoSaldo = epi.quantidadeEstoque + quantidade
      else if (tipo === 'AJUSTE') novoSaldo = quantidade
      else novoSaldo = epi.quantidadeEstoque - quantidade // SAIDA, PERDA, BAIXA

      if (novoSaldo < 0) {
        throw Object.assign(new Error('Quantidade insuficiente em estoque.'), { code: 'ESTOQUE_INSUFICIENTE' })
      }

      const empresaId = body.empresaId || epi.empresaId
      if (!empresaId) throw new Error('Informe a empresa do movimento.')

      const mov = await tx.estoqueEPI.create({
        data: {
          epiId: epi.id,
          empresaId,
          tipo: tipo as any,
          quantidade,
          dataMovimento: new Date(body.dataMovimento),
          fornecedor: body.fornecedor || null,
          notaFiscal: body.notaFiscal || null,
          responsavel: body.responsavel || null,
          motivo: body.motivo || null,
          observacao: body.observacao || null,
          usuarioId: (session.user as any).id ?? null,
        },
      })

      await tx.ePI.update({ where: { id: epi.id }, data: { quantidadeEstoque: novoSaldo } })

      return { mov, epiNome: epi.nome, novoSaldo }
    })

    await prisma.historico.create({
      data: {
        entidade: 'EPI',
        entidadeId: body.epiId,
        acao: 'ATUALIZAR',
        descricao: `Movimento de estoque (${tipo}) de ${quantidade} un. registrado para "${resultado.epiNome}" — novo saldo: ${resultado.novoSaldo}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(resultado.mov, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'ESTOQUE_INSUFICIENTE') return NextResponse.json({ error: 'Quantidade insuficiente em estoque.' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
