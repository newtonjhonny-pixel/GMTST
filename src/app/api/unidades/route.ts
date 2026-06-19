import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')
  const unidades = await prisma.unidade.findMany({
    where: {
      status: 'ATIVO',
      ...(empresaId ? { empresaId } : {}),
    },
    select: { id: true, nome: true, cidade: true, uf: true, empresaId: true },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(unidades)
}
