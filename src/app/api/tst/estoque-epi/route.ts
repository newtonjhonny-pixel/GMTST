import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const movimentos = await prisma.estoqueEPI.findMany({
    include: { epi: true, empresa: true },
    orderBy: { dataMovimento: 'desc' },
  })
  // Calcula saldo atual por EPI/empresa
  const saldos: Record<string, { epi: typeof movimentos[0]['epi']; empresa: typeof movimentos[0]['empresa']; saldo: number }> = {}
  for (const m of movimentos) {
    const key = `${m.epiId}__${m.empresaId}`
    if (!saldos[key]) saldos[key] = { epi: m.epi, empresa: m.empresa, saldo: 0 }
    if (m.tipo === 'ENTRADA') saldos[key].saldo += m.quantidade
    else if (m.tipo === 'SAIDA') saldos[key].saldo -= m.quantidade
    else saldos[key].saldo = m.quantidade
  }
  return NextResponse.json({ movimentos, saldos: Object.values(saldos) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const mov = await prisma.estoqueEPI.create({
      data: {
        epiId:         body.epiId,
        empresaId:     body.empresaId,
        tipo:          body.tipo,
        quantidade:    parseInt(body.quantidade),
        dataMovimento: new Date(body.dataMovimento),
        fornecedor:    body.fornecedor || null,
        notaFiscal:    body.notaFiscal || null,
        responsavel:   body.responsavel || null,
        observacao:    body.observacao || null,
      },
    })
    return NextResponse.json(mov, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
