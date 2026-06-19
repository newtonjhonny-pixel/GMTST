import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const registros = await prisma.registroIBAMA.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const registro = await prisma.registroIBAMA.create({
      data: {
        empresaId:     body.empresaId,
        unidadeId:     body.unidadeId ?? null,
        numeroCTF:     body.numeroCTF ?? null,
        certificadoReg: body.certificadoReg ?? null,
        validadeCR:    body.validadeCR ? new Date(body.validadeCR) : null,
        periodoRAPP:   body.periodoRAPP ?? null,
        dataEnvioRAPP: body.dataEnvioRAPP ? new Date(body.dataEnvioRAPP) : null,
        protocolo:     body.protocolo ?? null,
        responsavel:   body.responsavel ?? null,
        observacao:    body.observacao ?? null,
        status:        body.status ?? 'VIGENTE',
      },
    })
    return NextResponse.json(registro, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
