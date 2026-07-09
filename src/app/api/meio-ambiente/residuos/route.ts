import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')
  const situacao = searchParams.get('situacao')
  const classificacao = searchParams.get('classificacao')
  const q = searchParams.get('q')

  const residuos = await prisma.controleResiduo.findMany({
    where: {
      ...(empresaId ? { empresaId } : {}),
      ...(situacao ? { situacao: situacao as any } : {}),
      ...(classificacao ? { classificacao } : {}),
      ...(q ? {
        OR: [
          { descricao: { contains: q, mode: 'insensitive' } },
          { mtr: { contains: q, mode: 'insensitive' } },
          { codigoIBAMA: { contains: q, mode: 'insensitive' } },
          { responsavel: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: { empresa: true, unidade: true, coletor: true },
    orderBy: { dataGeracao: 'desc' },
  })
  return NextResponse.json(residuos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const residuo = await prisma.controleResiduo.create({
      data: {
        empresaId:          body.empresaId ?? null,
        unidadeId:          body.unidadeId ?? null,
        descricao:          body.descricao,
        tipoResiduo:        body.tipoResiduo || null,
        classificacao:      body.classificacao || null,
        codigoIBAMA:        body.codigoIBAMA ?? null,
        classeRisco:        body.classeRisco ?? null,
        origem:             body.origem || null,
        setorGerador:       body.setorGerador || null,
        quantidade:         parseFloat(body.quantidade),
        unidadeMedida:      body.unidadeMedida,
        peso:               body.peso ? parseFloat(body.peso) : null,
        formaArmazenamento: body.formaArmazenamento || null,
        dataGeracao:        new Date(body.dataGeracao),
        dataColeta:         body.dataColeta ? new Date(body.dataColeta) : null,
        dataDestinacao:     body.dataDestinacao ? new Date(body.dataDestinacao) : null,
        destinacao:         body.destinacao,
        empresaColetora:    body.empresaColetora ?? null,
        coletorId:          body.coletorId || null,
        responsavel:        body.responsavel || null,
        situacao:           body.situacao || 'GERADO',
        mtr:                body.mtr ?? null,
        certificadoDest:    body.certificadoDest ?? null,
        observacao:         body.observacao ?? null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'CONTROLE_RESIDUO',
        entidadeId: residuo.id,
        acao: 'CRIAR',
        descricao: `Resíduo "${residuo.descricao}" cadastrado${residuo.mtr ? ` (MTR ${residuo.mtr})` : ''}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(residuo, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
