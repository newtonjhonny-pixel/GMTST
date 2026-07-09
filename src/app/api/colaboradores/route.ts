import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unidadeId = searchParams.get('unidadeId')

  const colaboradores = await prisma.colaborador.findMany({
    where: {
      status: 'ATIVO',
      ...(unidadeId ? { unidadeId } : {}),
    },
    select: { id: true, nome: true, cpf: true, funcao: true, setor: true, unidadeId: true },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(colaboradores)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()

    if (!body.nome || !body.cpf || !body.unidadeId || !body.setor || !body.funcao || !body.admissao) {
      return NextResponse.json({ error: 'Nome, CPF, unidade, setor, função e data de admissão são obrigatórios.' }, { status: 400 })
    }

    const cpfLimpo = String(body.cpf).replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido. Informe os 11 dígitos.' }, { status: 400 })
    }

    const colaborador = await prisma.colaborador.create({
      data: {
        nome:      body.nome,
        cpf:       cpfLimpo,
        matricula: body.matricula || null,
        unidadeId: body.unidadeId,
        setor:     body.setor,
        funcao:    body.funcao,
        admissao:  new Date(body.admissao),
        status:    body.status ?? 'ATIVO',
        riscos:    Array.isArray(body.riscos) ? body.riscos : [],
      },
    })
    return NextResponse.json(colaborador, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Já existe um colaborador cadastrado com este CPF.' }, { status: 409 })
    if (err?.code === 'P2003') return NextResponse.json({ error: 'Unidade informada não existe.' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
