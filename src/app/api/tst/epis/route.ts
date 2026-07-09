import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()

    if (!body.colaboradorId || !body.epiId || !body.dataEntrega) {
      return NextResponse.json({ error: 'Colaborador, EPI e data de entrega são obrigatórios.' }, { status: 400 })
    }

    const entrega = await prisma.entregaEPI.create({
      data: {
        colaboradorId:  body.colaboradorId,
        epiId:          body.epiId,
        dataEntrega:    new Date(body.dataEntrega),
        dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
        quantidade:     body.quantidade ? parseInt(body.quantidade) : 1,
        observacao:     body.observacao || null,
      },
    })
    return NextResponse.json(entrega, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2003') return NextResponse.json({ error: 'Colaborador ou EPI informado não existe.' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
