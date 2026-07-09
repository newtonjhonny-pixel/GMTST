import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params
  const reg = await prisma.coletaSeletiva.findUnique({
    where: { id },
    include: { empresa: true, unidade: true, coletor: true },
  })
  if (!reg) return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
  return NextResponse.json(reg)
}
