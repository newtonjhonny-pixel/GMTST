'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

/* ── Types ── */
interface Kpis {
  pendenciasAbertas: number; pendenciasVencidas: number
  docVencidos: number; docAVencer: number
  taxasPendentes: number; certVencidas: number
  licencasVencidas: number; licencasAVencer: number
  totalEmpresas: number; totalColaboradores: number
  asosVencidos: number; episCaVencidos: number; treinamentosVencidos: number
  extVencidos: number; extAVencer: number
  condAtrasadas: number; condPendentes: number
  recursosVencidos: number; recursosAVencer: number
  monitNaoConformes: number; monitTotal: number
}
interface Pendencia {
  id: string; descricao: string; status: string
  prazo: string | null; prioridade: string; empresa: string
}
interface Vencimento {
  id: string; tipo: string; modulo: string; vencimento: string | null; empresa: string
}
interface EmpresaSaude {
  id: string; nome: string
  pendenciasVencidas: number; licencasVencidas: number
  extVencidos: number; recursosVencidos: number
}

/* ── Helpers ── */
function diasPara(iso: string | null) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}
function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

const STATUS_LABEL: Record<string, string> = {
  ABERTA: 'Aberta', EM_ANDAMENTO: 'Em andamento', VENCIDA: 'Vencida', CONCLUIDA: 'Concluída',
}
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ABERTA:       { bg: '#eff6ff', text: '#3b82f6' },
  EM_ANDAMENTO: { bg: '#fffbeb', text: '#d97706' },
  VENCIDA:      { bg: '#fef2f2', text: '#ef4444' },
  CONCLUIDA:    { bg: '#f0fdf4', text: '#16a34a' },
}
const PRIORIDADE_COLOR: Record<string, string> = {
  CRITICA: '#ef4444', ALTA: '#f97316', MEDIA: '#f59e0b', BAIXA: '#10b981',
}
const MODULO_COLOR: Record<string, string> = {
  'Certificação': '#8b5cf6', 'Extintor': '#f97316', 'Rec. Hídrico': '#0891b2',
}

/* ── KPI Card ── */
function KpiCard({
  label, value, colorFrom, colorTo, icon, trend, href,
}: {
  label: string; value: number | string
  colorFrom: string; colorTo: string
  icon: string; trend?: { label: string; danger?: boolean }
  href?: string
}) {
  const inner = (
    <div
      className="relative rounded-xl overflow-hidden transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: href ? 'pointer' : 'default' }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider leading-snug" style={{ color: 'var(--text-muted)', maxWidth: '65%' }}>
            {label}
          </p>
          <div className="flex items-center justify-center rounded-lg text-base shrink-0" style={{ width: 32, height: 32, background: `${colorFrom}20` }}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-extrabold leading-none mb-2" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {trend && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: trend.danger ? '#fef2f2' : '#f0fdf4', color: trend.danger ? '#dc2626' : '#16a34a' }}>
            {trend.label}
          </span>
        )}
      </div>
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

/* ── Section title ── */
function Section({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ── Row divider ── */
function RowLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-2 mt-5">
      <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

/* ── Saúde semáforo ── */
function Semaforo({ value, label }: { value: number; label: string }) {
  const color = value === 0 ? '#16a34a' : value <= 2 ? '#d97706' : '#dc2626'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color + '22', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2px' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color }}>{value}</span>
      </div>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', whiteSpace: 'nowrap' }}>{label}</p>
    </div>
  )
}

/* ── Main ── */
export function DashboardClient({ kpis, pendencias, vencimentos, empresas }: {
  kpis: Kpis; pendencias: Pendencia[]; vencimentos: Vencimento[]; empresas: EmpresaSaude[]
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#1e293b' : '#f1f5f9'

  const barData = [
    kpis.asosVencidos + kpis.episCaVencidos + kpis.treinamentosVencidos,
    kpis.licencasVencidas + kpis.condAtrasadas + kpis.monitNaoConformes,
    kpis.certVencidas,
    kpis.taxasPendentes,
    kpis.docVencidos,
  ]

  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    plotOptions: { bar: { borderRadius: 5, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['SST', 'M.Amb.', 'Certif.', 'Taxas', 'Docs'],
      labels: { style: { colors: textColor, fontSize: '11px', fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: textColor, fontSize: '11px' } } },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light', type: 'vertical', stops: [0, 100],
        colorStops: Array(5).fill([
          { offset: 0, color: '#38bdf8', opacity: 1 },
          { offset: 100, color: '#6366f1', opacity: 1 },
        ]),
      },
    },
    tooltip: { theme: isDark ? 'dark' : 'light' },
    theme: { mode: isDark ? 'dark' : 'light' },
  }

  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    labels: ['SST', 'M.Ambiente', 'Certificações', 'Taxas', 'Documentos'],
    colors: ['#38bdf8', '#6366f1', '#10b981', '#f59e0b', '#ef4444'],
    legend: { position: 'bottom', fontSize: '11px', labels: { colors: textColor }, itemMargin: { horizontal: 6 } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: {
      show: true, label: 'Itens', fontSize: '11px', color: textColor,
      formatter: () => String(barData.reduce((a, b) => a + b, 0)),
    } } } } },
    stroke: { width: 0 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
    theme: { mode: isDark ? 'dark' : 'light' },
  }

  const taxaConformidade = kpis.monitTotal > 0
    ? (((kpis.monitTotal - kpis.monitNaoConformes) / kpis.monitTotal) * 100).toFixed(0) + '%'
    : '—'

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Dashboard</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Visão executiva · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Row 1 — Atenção imediata */}
      <RowLabel label="Atenção imediata" />
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard href="/pendencias" label="Pendências Vencidas" value={kpis.pendenciasVencidas} icon="🚨"
          colorFrom="#ef4444" colorTo="#f97316"
          trend={kpis.pendenciasVencidas > 0 ? { label: 'Ação requerida', danger: true } : { label: 'Nenhuma', danger: false }} />
        <KpiCard href="/pendencias" label="Pendências Abertas" value={kpis.pendenciasAbertas} icon="📋"
          colorFrom="#f59e0b" colorTo="#eab308"
          trend={{ label: `${kpis.pendenciasAbertas} ativas`, danger: kpis.pendenciasAbertas > 5 }} />
        <KpiCard href="/tst/asos" label="ASOs Vencidos" value={kpis.asosVencidos} icon="🩺"
          colorFrom="#ef4444" colorTo="#ec4899"
          trend={kpis.asosVencidos > 0 ? { label: 'Renovar urgente', danger: true } : { label: 'Em dia', danger: false }} />
        <KpiCard href="/tst/epis" label="CAs de EPI Vencidos" value={kpis.episCaVencidos} icon="⛑️"
          colorFrom="#f97316" colorTo="#ef4444"
          trend={kpis.episCaVencidos > 0 ? { label: 'Substituir', danger: true } : { label: 'Em dia', danger: false }} />
      </div>

      {/* Row 2 — Documentos e conformidade */}
      <RowLabel label="Documentos e conformidade" />
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard href="/tst/treinamentos" label="Treinamentos Vencidos" value={kpis.treinamentosVencidos} icon="🎓"
          colorFrom="#8b5cf6" colorTo="#6366f1"
          trend={kpis.treinamentosVencidos > 0 ? { label: 'Requalificar', danger: true } : { label: 'Em dia', danger: false }} />
        <KpiCard href="/documentos" label="Documentos Vencidos" value={kpis.docVencidos} icon="📄"
          colorFrom="#ef4444" colorTo="#f97316"
          trend={kpis.docVencidos > 0 ? { label: 'Renovar', danger: true } : { label: 'Em dia', danger: false }} />
        <KpiCard href="/meio-ambiente/licencas" label="Licenças Vencidas" value={kpis.licencasVencidas} icon="🌿"
          colorFrom="#ef4444" colorTo="#ec4899"
          trend={kpis.licencasVencidas > 0 ? { label: 'Crítico', danger: true } : { label: 'Em dia', danger: false }} />
        <KpiCard href="/certificacoes" label="Certif. Vencidas" value={kpis.certVencidas} icon="🏅"
          colorFrom="#8b5cf6" colorTo="#6366f1"
          trend={kpis.certVencidas > 0 ? { label: 'Renovar', danger: true } : { label: 'Em dia', danger: false }} />
      </div>

      {/* Row 3 — SST Operacional (novo Fase 6) */}
      <RowLabel label="SST e Meio Ambiente — operacional" />
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard href="/tst/extintores" label="Extintores Vencidos" value={kpis.extVencidos} icon="🧯"
          colorFrom="#dc2626" colorTo="#f97316"
          trend={kpis.extVencidos > 0 ? { label: `+ ${kpis.extAVencer} a vencer 30d`, danger: true } : { label: kpis.extAVencer > 0 ? `${kpis.extAVencer} a vencer` : 'Em dia', danger: kpis.extAVencer > 0 }} />
        <KpiCard href="/meio-ambiente/condicionantes" label="Condicionantes Atrasadas" value={kpis.condAtrasadas} icon="⚠️"
          colorFrom="#f59e0b" colorTo="#ef4444"
          trend={kpis.condAtrasadas > 0 ? { label: `+ ${kpis.condPendentes} pendentes`, danger: true } : { label: kpis.condPendentes > 0 ? `${kpis.condPendentes} pendentes` : 'Em dia', danger: kpis.condPendentes > 0 }} />
        <KpiCard href="/meio-ambiente/recursos-hidricos" label="Recursos Hídricos Vencidos" value={kpis.recursosVencidos} icon="💧"
          colorFrom="#0891b2" colorTo="#6366f1"
          trend={kpis.recursosVencidos > 0 ? { label: `+ ${kpis.recursosAVencer} a vencer 60d`, danger: true } : { label: kpis.recursosAVencer > 0 ? `${kpis.recursosAVencer} a vencer` : 'Em dia', danger: kpis.recursosAVencer > 0 }} />
        <KpiCard href="/meio-ambiente/monitoramentos" label="Monitoram. Não Conformes" value={kpis.monitNaoConformes} icon="📊"
          colorFrom="#7c3aed" colorTo="#6366f1"
          trend={{ label: `Conformidade: ${taxaConformidade}`, danger: kpis.monitNaoConformes > 0 }} />
      </div>

      {/* Row 4 — Visão geral */}
      <RowLabel label="Visão geral" />
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard href="/taxas" label="Taxas Pendentes" value={kpis.taxasPendentes} icon="💳"
          colorFrom="#f59e0b" colorTo="#eab308"
          trend={kpis.taxasPendentes > 0 ? { label: 'Pagamento devido', danger: true } : { label: 'Em dia', danger: false }} />
        <KpiCard href="/documentos" label="Docs. a Vencer (30d)" value={kpis.docAVencer} icon="⏰"
          colorFrom="#38bdf8" colorTo="#6366f1"
          trend={{ label: 'Próximos 30 dias', danger: false }} />
        <KpiCard href="/empresas" label="Empresas Ativas" value={kpis.totalEmpresas} icon="🏢"
          colorFrom="#38bdf8" colorTo="#06b6d4" />
        <KpiCard href="/colaboradores" label="Colaboradores" value={kpis.totalColaboradores} icon="👷"
          colorFrom="#10b981" colorTo="#06b6d4"
          trend={{ label: 'Ativos', danger: false }} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <Section title="Itens por Módulo" sub="Pendências e vencimentos ativos" />
          <ApexChart type="bar" options={barOptions} series={[{ name: 'Itens', data: barData }]} height={180} />
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <Section title="Distribuição" sub="Proporção por área" />
          <ApexChart type="donut" options={donutOptions} series={barData.map(v => Math.max(v, 0))} height={180} />
        </div>
      </div>

      {/* Saúde por Empresa (novo Fase 6) */}
      {empresas.length > 0 && (
        <div className="rounded-xl mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 pt-5 pb-3">
            <Section title="Saúde por Empresa" sub="Itens críticos por empresa ativa"
              action={<Link href="/empresas" className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver todas →</Link>} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 20px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Empresa</th>
                  {[
                    'Pendências\nVencidas', 'Licenças\nVencidas', 'Extintores\nVencidos', 'Rec. Hídricos\nVencidos', 'Status Geral',
                  ].map(h => (
                    <th key={h} style={{ textAlign: 'center', padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'pre-line' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empresas.map(emp => {
                  const total = emp.pendenciasVencidas + emp.licencasVencidas + emp.extVencidos + emp.recursosVencidos
                  const status = total === 0 ? { label: 'OK', bg: '#f0fdf4', text: '#16a34a' }
                    : total <= 3    ? { label: 'Atenção', bg: '#fffbeb', text: '#d97706' }
                    :                 { label: 'Crítico', bg: '#fef2f2', text: '#dc2626' }
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link href={`/empresas/${emp.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{emp.nome}</Link>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Semaforo value={emp.pendenciasVencidas} label="" /></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Semaforo value={emp.licencasVencidas} label="" /></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Semaforo value={emp.extVencidos} label="" /></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Semaforo value={emp.recursosVencidos} label="" /></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: status.bg, color: status.text }}>{status.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lists */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Pendências recentes */}
        <div className="rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 pt-5 pb-3">
            <Section title="Pendências Recentes" sub="Itens que requerem atenção"
              action={<Link href="/pendencias" className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver todas →</Link>} />
          </div>
          <div>
            {pendencias.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>✅ Nenhuma pendência aberta</div>
            ) : (
              pendencias.map((p) => {
                const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS.ABERTA
                const pc = PRIORIDADE_COLOR[p.prioridade] ?? '#94a3b8'
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: pc }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.descricao}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.empresa} · {fmt(p.prazo)}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: sc.bg, color: sc.text }}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Próximos vencimentos — multi-módulo */}
        <div className="rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 pt-5 pb-3">
            <Section title="Próximos Vencimentos" sub="Certificações, extintores e recursos hídricos"
              action={<Link href="/relatorios" className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Relatórios →</Link>} />
          </div>
          <div>
            {vencimentos.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>✅ Nenhum vencimento próximo</div>
            ) : (
              vencimentos.map((v) => {
                const dias = diasPara(v.vencimento)
                const isRed = dias !== null && dias <= 7
                const isAmb = dias !== null && dias <= 15
                const mc = MODULO_COLOR[v.modulo] ?? '#64748b'
                return (
                  <div key={v.id + v.modulo} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isRed ? '#ef4444' : isAmb ? '#f59e0b' : '#10b981' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span style={{ fontSize: 9, fontWeight: 700, color: mc, background: mc + '18', padding: '1px 6px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '.3px' }}>{v.modulo}</span>
                      </div>
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{v.tipo}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{v.empresa} · {fmt(v.vencimento)}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg shrink-0" style={{ background: isRed ? '#fef2f2' : isAmb ? '#fffbeb' : '#f0fdf4', color: isRed ? '#ef4444' : isAmb ? '#d97706' : '#16a34a' }}>
                      {dias !== null ? `${dias}d` : '—'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
