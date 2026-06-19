import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const usuarios = await prisma.user.findMany({
    where: { ativo: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(usuarios)
}
