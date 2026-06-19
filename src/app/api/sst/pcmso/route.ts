import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const pcmsos = await prisma.pCMSO.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(pcmsos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const pcmso = await prisma.pCMSO.create({
      data: {
        empresaId:         body.empresaId,
        unidadeId:         body.unidadeId,
        medicoResponsavel: body.medicoResponsavel,
        crm:               body.crm ?? null,
        clinica:           body.clinica ?? null,
        vigenciaInicial:   new Date(body.vigenciaInicial),
        vigenciaFinal:     body.vigenciaFinal ? new Date(body.vigenciaFinal) : null,
        status:            body.status ?? 'VIGENTE',
        observacao:        body.observacao ?? null,
      },
    })
    return NextResponse.json(pcmso, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
