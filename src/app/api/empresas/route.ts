import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const empresas = await prisma.empresa.findMany({
    where: { status: 'ATIVO' },
    select: { id: true, razaoSocial: true, cnpj: true, codigo: true },
    orderBy: { razaoSocial: 'asc' },
  })
  return NextResponse.json(empresas)
}
