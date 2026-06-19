export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/lib/theme-context'
import { prisma } from '@/lib/prisma'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const pendenciasCount = await prisma.pendencia.count({
    where: { status: { in: ['ABERTA', 'VENCIDA', 'EM_ANDAMENTO'] } },
  })

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>
          <Sidebar pendenciasCount={pendenciasCount} />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
