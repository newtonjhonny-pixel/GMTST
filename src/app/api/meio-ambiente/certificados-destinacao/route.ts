import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const empresaId = searchParams.get('empresaId')
  const certs = await prisma.certificadoDestinacao.findMany({
    where: {
      ...(empresaId ? { empresaId } : {}),
      ...(q ? {
        OR: [
          { numero: { contains: q, mode: 'insensitive' } },
          { responsavel: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: { empresa: true, unidade: true, coletor: true },
    orderBy: { dataEmissao: 'desc' },
  })
  return NextResponse.json(certs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const cert = await prisma.certificadoDestinacao.create({
      data: {
        empresaId:       body.empresaId,
        unidadeId:       body.unidadeId || null,
        coletorId:       body.coletorId,
        numero:          body.numero || null,
        dataEmissao:     new Date(body.dataEmissao),
        dataVencimento:  body.dataVencimento ? new Date(body.dataVencimento) : null,
        tiposResiduos:   body.tiposResiduos ?? [],
        quantidadeTotal: body.quantidadeTotal ? parseFloat(body.quantidadeTotal) : null,
        peso:            body.peso ? parseFloat(body.peso) : null,
        unidadeMedida:   body.unidadeMedida || null,
        formaDestinacao: body.formaDestinacao || null,
        responsavel:     body.responsavel || null,
        observacao:      body.observacao || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'CERTIFICADO_DESTINACAO',
        entidadeId: cert.id,
        acao: 'CRIAR',
        descricao: `Certificado de destinação nº ${cert.numero ?? cert.id} cadastrado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(cert, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
