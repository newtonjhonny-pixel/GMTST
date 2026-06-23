'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Building2, Users, HardHat, Leaf, Award, Receipt,
  FileText, AlertTriangle, BarChart3, Settings, ChevronDown,
  ChevronRight, Shield, PanelLeftClose, PanelLeftOpen,
  ClipboardList, FlaskConical, Flame, TreePine, BadgeCheck,
  BookOpen, ActivitySquare, Globe, Waves, ClipboardCheck,
  ScrollText, History, FilePen,
} from 'lucide-react'
import { useState } from 'react'

interface NavChild {
  href: string
  label: string
}

interface NavItem {
  href?: string
  label: string
  icon: React.ElementType
  badge?: number
  children?: NavChild[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { href: '/empresas',      label: 'Empresas e Unidades', icon: Building2 },
      { href: '/colaboradores', label: 'Colaboradores',        icon: Users },
    ],
  },
  {
    label: 'SST',
    items: [
      {
        label: 'Gestão SST', icon: ClipboardList,
        children: [
          { href: '/sst/pgr',               label: 'PGR' },
          { href: '/sst/pcmso',             label: 'PCMSO' },
          { href: '/sst/ltcat',             label: 'LTCAT' },
          { href: '/sst/ppp',               label: 'PPP' },
          { href: '/sst/inventario-riscos', label: 'Inventário de Riscos' },
          { href: '/sst/esocial',           label: 'eSocial SST' },
        ],
      },
      { href: '/tst/epis',         label: 'EPIs',            icon: HardHat },
      { href: '/tst/asos',         label: 'ASOs',            icon: ClipboardCheck },
      { href: '/tst/treinamentos',    label: 'Treinamentos',    icon: BookOpen },
      { href: '/tst/ordens-servico', label: 'Ordens de Serviço', icon: FilePen },
      { href: '/tst/acidentes',      label: 'Acidentes e CAT', icon: ActivitySquare },
      { href: '/tst/inspecoes',    label: 'Inspeções',       icon: ScrollText },
      { href: '/sst/avcb',         label: 'AVCB / Bombeiros',icon: Flame },
    ],
  },
  {
    label: 'Meio Ambiente',
    items: [
      { href: '/meio-ambiente/licencas',          label: 'Licenças Ambientais',     icon: TreePine },
      { href: '/meio-ambiente/condicionantes',    label: 'Condicionantes',          icon: AlertTriangle },
      { href: '/meio-ambiente/ibama',             label: 'IBAMA / CTF / RAPP',      icon: Globe },
      { href: '/meio-ambiente/residuos',          label: 'Resíduos / MTR',          icon: Leaf },
      { href: '/meio-ambiente/produtos-quimicos', label: 'Produtos Químicos / FISPQ',icon: FlaskConical },
      { href: '/meio-ambiente/monitoramentos',    label: 'Monitoramentos',          icon: Waves },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/certificacoes', label: 'Certificações',    icon: Award },
      { href: '/taxas',         label: 'Taxas e Pagamentos',icon: Receipt },
      { href: '/documentos',    label: 'Documentos Legais', icon: FileText },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/pendencias', label: 'Pendências / Plano de Ação', icon: AlertTriangle, badge: -1 },
      { href: '/relatorios', label: 'Relatórios',                  icon: BarChart3 },
      { href: '/auditoria',  label: 'Auditoria',                   icon: History },
    ],
  },
  {
    label: 'Administração',
    items: [
      { href: '/admin/usuarios', label: 'Usuários e Perfis', icon: Shield },
    ],
  },
]

export function Sidebar({ pendenciasCount = 0 }: { pendenciasCount?: number }) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useTheme()
  const [expanded, setExpanded] = useState<string[]>(['Gestão SST'])

  const toggle = (label: string) =>
    setExpanded(p => p.includes(label) ? p.filter(l => l !== label) : [...p, label])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const groupActive = (children: NavChild[]) => children.some(c => isActive(c.href))

  const collapsed = sidebarCollapsed

  return (
    <aside
      className={cn('sidebar-rail flex h-screen flex-col shrink-0')}
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-sidebar)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-3.5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-sidebar)', height: 'var(--topbar-height)' }}
      >
        <div
          className="flex items-center justify-center shrink-0 rounded-lg font-black text-white text-sm"
          style={{ width: 30, height: 30, background: 'var(--brand-gradient)' }}
        >
          G
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold" style={{ color: 'var(--text-inverted)', letterSpacing: '-.3px' }}>
                GMTST
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                SST · Meio Ambiente
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="shrink-0 flex items-center justify-center rounded-md transition-colors"
              style={{ width: 26, height: 26, color: 'var(--text-sidebar)' }}
              title="Recolher sidebar"
            >
              <PanelLeftClose size={14} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? '10px 5px' : '10px 8px' }}>
        {navGroups.map((group, gi) => (
          <div key={group.label} style={{ marginBottom: collapsed ? 8 : 4 }}>
            {/* Group label */}
            {!collapsed && (
              <div
                className="px-2 text-[9px] font-bold uppercase tracking-widest select-none"
                style={{
                  color: '#334155',
                  marginTop: gi === 0 ? 4 : 14,
                  marginBottom: 3,
                }}
              >
                {group.label}
              </div>
            )}
            {collapsed && gi > 0 && (
              <div style={{ height: 1, background: 'var(--border-sidebar)', margin: '8px 4px' }} />
            )}

            {group.items.map(item => {
              if (item.children) {
                const isExp = expanded.includes(item.label)
                const active = groupActive(item.children)
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => !collapsed && toggle(item.label)}
                      title={collapsed ? item.label : undefined}
                      className="w-full flex items-center gap-2 rounded-lg transition-colors"
                      style={{
                        padding: collapsed ? '7px' : '6px 8px',
                        marginBottom: 1,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        background: active ? 'var(--bg-sidebar-active)' : 'transparent',
                        color: active ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                      }}
                    >
                      <item.icon size={14} className="shrink-0" style={{ opacity: active ? 1 : .65 }} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-[11px] font-medium truncate">{item.label}</span>
                          {isExp ? <ChevronDown size={11} style={{ opacity: .5 }} /> : <ChevronRight size={11} style={{ opacity: .5 }} />}
                        </>
                      )}
                    </button>
                    {isExp && !collapsed && (
                      <div className="mb-1" style={{ marginLeft: 20, borderLeft: '1px solid var(--border-sidebar)', paddingLeft: 8 }}>
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-2 rounded-md transition-colors"
                            style={{
                              padding: '5px 8px',
                              marginBottom: 1,
                              fontSize: 11,
                              fontWeight: isActive(child.href) ? 600 : 400,
                              background: isActive(child.href) ? 'var(--bg-sidebar-active)' : 'transparent',
                              color: isActive(child.href) ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                            }}
                          >
                            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: isActive(child.href) ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)', opacity: .5 }} />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              const active = isActive(item.href!)
              const badgeCount = item.badge === -1 ? pendenciasCount : item.badge

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  title={collapsed ? item.label : undefined}
                  className="flex items-center gap-2 rounded-lg transition-colors relative"
                  style={{
                    padding: collapsed ? '7px' : '6px 8px',
                    marginBottom: 1,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: active ? 'var(--bg-sidebar-active)' : 'transparent',
                    color: active ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                  }}
                >
                  <item.icon size={14} className="shrink-0" style={{ opacity: active ? 1 : .65 }} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-[11px] font-medium truncate">{item.label}</span>
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: '#ef4444', color: '#fff' }}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && badgeCount !== undefined && badgeCount > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border-sidebar)', padding: collapsed ? '8px 5px' : '8px' }}>
        {collapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center rounded-lg transition-colors"
            style={{ height: 32, color: 'var(--text-sidebar)' }}
            title="Expandir sidebar"
          >
            <PanelLeftOpen size={14} />
          </button>
        ) : (
          <Link
            href="/configuracoes"
            className="flex items-center gap-2 rounded-lg transition-colors"
            style={{ padding: '6px 8px', color: 'var(--text-sidebar)', fontSize: 11, fontWeight: 500 }}
          >
            <Settings size={13} style={{ opacity: .65 }} />
            Configurações
          </Link>
        )}
      </div>
    </aside>
  )
}
