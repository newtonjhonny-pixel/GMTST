import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const epis = await prisma.ePI.findMany({
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true, ca: true },
  })
  return NextResponse.json(epis)
}
