import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const material = searchParams.get('material')
  const empresaId = searchParams.get('empresaId')
  const registros = await prisma.coletaSeletiva.findMany({
    where: {
      ...(material ? { material: material as any } : {}),
      ...(empresaId ? { empresaId } : {}),
    },
    include: { empresa: true, unidade: true, coletor: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await req.json()
    const reg = await prisma.coletaSeletiva.create({
      data: {
        empresaId:     body.empresaId,
        unidadeId:     body.unidadeId,
        local:         body.local || null,
        responsavel:   body.responsavel || null,
        frequencia:    body.frequencia || null,
        data:          new Date(body.data),
        material:      body.material,
        quantidade:    parseFloat(body.quantidade),
        peso:          body.peso ? parseFloat(body.peso) : null,
        unidadeMedida: body.unidadeMedida || 'kg',
        destinacao:    body.destinacao || null,
        coletorId:     body.coletorId || null,
        observacao:    body.observacao || null,
      },
    })

    await prisma.historico.create({
      data: {
        entidade: 'COLETA_SELETIVA',
        entidadeId: reg.id,
        acao: 'CRIAR',
        descricao: `Registro de coleta seletiva (${reg.material}) cadastrado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(reg, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
