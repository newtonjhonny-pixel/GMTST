import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const certs = await prisma.certificacao.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })
  return NextResponse.json(certs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const cert = await prisma.certificacao.create({
      data: {
        tipo:              body.tipo,
        orgaoCertificador: body.orgaoCertificador,
        empresaId:         body.empresaId,
        unidadeId:         body.unidadeId,
        emissao:           body.emissao ? new Date(body.emissao) : null,
        vencimento:        new Date(body.vencimento),
        responsavel:       body.responsavel ?? null,
        alertaDias:        body.alertaDias ? parseInt(body.alertaDias) : 30,
        status:            body.status ?? 'VIGENTE',
        observacao:        body.observacao ?? null,
      },
    })
    return NextResponse.json(cert, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
