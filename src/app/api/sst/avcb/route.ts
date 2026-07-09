import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const empresaId = searchParams.get('empresaId')
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  const avcbs = await prisma.aVCB.findMany({
    where: {
      ...(tipo ? { tipo: tipo as any } : {}),
      ...(empresaId ? { empresaId } : {}),
      ...(status ? { status: status as any } : {}),
      ...(q ? {
        OR: [
          { numero: { contains: q, mode: 'insensitive' } },
          { responsavelTecnico: { contains: q, mode: 'insensitive' } },
          { orgaoEmissor: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: { empresa: true, unidade: true },
    orderBy: { dataValidade: 'asc' },
  })
  return NextResponse.json(avcbs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const avcb = await prisma.aVCB.create({
      data: {
        empresaId:          body.empresaId,
        unidadeId:          body.unidadeId,
        numero:             body.numero,
        tipo:               body.tipo ?? 'AVCB',
        orgaoEmissor:       body.orgaoEmissor,
        dataEmissao:        body.dataEmissao ? new Date(body.dataEmissao) : null,
        dataValidade:       new Date(body.dataValidade),
        areaProtegida:      body.areaProtegida ? parseFloat(body.areaProtegida) : null,
        responsavelTecnico: body.responsavelTecnico || null,
        crea:               body.crea || null,
        status:             body.status ?? 'VIGENTE',
        observacao:         body.observacao || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'AVCB',
        entidadeId: avcb.id,
        acao: 'CRIAR',
        descricao: `${avcb.tipo} nº ${avcb.numero} cadastrado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(avcb, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
