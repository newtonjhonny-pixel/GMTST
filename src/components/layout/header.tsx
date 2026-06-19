'use client'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Bell, LogOut, User, Moon, Sun, Search } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'

export function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const userName = session?.user?.name ?? 'Usuário'
  const userRole = (session?.user as any)?.role ?? ''
  const userInitial = userName[0]?.toUpperCase() ?? 'U'

  const roleLabel: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    ANALISTA_TST: 'Analista TST',
    ANALISTA_MA: 'Analista M.Ambiente',
    GERENTE: 'Gerente',
    COORDENADOR: 'Coordenador',
    CONSULTA: 'Consulta',
  }

  return (
    <header
      className="flex items-center shrink-0 px-5 gap-3"
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--bg-topbar)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-lg px-3"
        style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border)',
          height: 34,
          width: 200,
          color: 'var(--text-muted)',
          fontSize: 12,
        }}
      >
        <Search size={13} />
        <span>Buscar...</span>
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center rounded-lg transition-colors"
        style={{
          width: 34, height: 34,
          background: 'var(--bg-app)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
        title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      >
        {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
      </button>

      {/* Notifications */}
      <button
        className="relative flex items-center justify-center rounded-lg transition-colors"
        style={{
          width: 34, height: 34,
          background: 'var(--bg-app)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        <Bell size={15} />
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: '#ef4444', border: '1.5px solid var(--bg-topbar)' }}
        />
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors"
          style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
            style={{ width: 26, height: 26, background: 'var(--brand-gradient)' }}
          >
            {userInitial}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
              {userName}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {roleLabel[userRole] ?? userRole}
            </p>
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 top-full mt-1.5 w-48 rounded-xl z-50 overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="p-1">
                <button
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-app)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={14} />
                  Meu Perfil
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
