import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Rota de setup protegida por SETUP_SECRET.
// Desabilitada em producao a menos que SETUP_SECRET esteja definido.
// Uso: GET /api/setup?secret=<SETUP_SECRET>
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Rota de setup desabilitada em producao.' }, { status: 403 })
  }

  const secret = req.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.SETUP_SECRET

  if (!expectedSecret) {
    return NextResponse.json({ error: 'SETUP_SECRET nao configurado.' }, { status: 403 })
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@gmtst.com' } })

    if (existing) {
      return NextResponse.json({ ok: true, message: 'Usuario admin ja existe. Nenhuma alteracao feita.' })
    }

    const hash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD ?? 'mude-esta-senha', 12)
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@gmtst.com',
        password: hash,
        role: 'ADMINISTRADOR',
        ativo: true,
      },
    })

    return NextResponse.json({ ok: true, message: 'Usuario admin criado. Altere a senha imediatamente apos o primeiro login.' })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
