import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const status = searchParams.get('status')
  const coletoras = await prisma.empresaColetora.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(q ? {
        OR: [
          { razaoSocial: { contains: q, mode: 'insensitive' } },
          { nomeFantasia: { contains: q, mode: 'insensitive' } },
          { cnpj: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    orderBy: { razaoSocial: 'asc' },
  })
  return NextResponse.json(coletoras)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const coletora = await prisma.empresaColetora.create({
      data: {
        razaoSocial:      body.razaoSocial,
        nomeFantasia:     body.nomeFantasia || null,
        cnpj:             body.cnpj || null,
        telefone:         body.telefone || null,
        email:            body.email || null,
        responsavel:      body.responsavel || null,
        licencaAmbiental: body.licencaAmbiental || null,
        numeroLicenca:    body.numeroLicenca || null,
        validadeLicenca:  body.validadeLicenca ? new Date(body.validadeLicenca) : null,
        endereco:         body.endereco || null,
        municipio:        body.municipio || null,
        estado:           body.estado || null,
        tiposResiduos:    body.tiposResiduos ?? [],
        status:           body.status ?? 'ATIVO',
        observacao:       body.observacao || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'EMPRESA_COLETORA',
        entidadeId: coletora.id,
        acao: 'CRIAR',
        descricao: `Empresa coletora "${coletora.razaoSocial}" cadastrada`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(coletora, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
