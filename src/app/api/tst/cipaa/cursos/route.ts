import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const cursos = await prisma.cursoCipaa.findMany({
    include: { empresa: true, colaborador: true },
    orderBy: { dataCurso: 'desc' },
  })
  return NextResponse.json(cursos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const curso = await prisma.cursoCipaa.create({
      data: {
        empresaId:     body.empresaId,
        colaboradorId: body.colaboradorId,
        dataCurso:     new Date(body.dataCurso),
        cargaHoraria:  body.cargaHoraria ? parseInt(body.cargaHoraria) : null,
        instrutor:     body.instrutor || null,
        instituicao:   body.instituicao || null,
        validade:      body.validade ? new Date(body.validade) : null,
        certificado:   body.certificado || null,
        observacao:    body.observacao || null,
      },
    })
    return NextResponse.json(curso, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
