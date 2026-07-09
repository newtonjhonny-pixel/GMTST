'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import {
  Building2, Users, ClipboardList, HardHat, BookOpen, Flame, TreePine,
  AlertTriangle, Globe, FileCheck2, Droplets, Recycle, Truck, FileCheck,
  FlaskConical, Waves, Printer,
} from 'lucide-react'

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

/* ── Types ── */
interface Kpis {
  pendenciasAbertas: number; pendenciasVencidas: number
  licencasVencidas: number; licencasVencendo30: number; licencasVencendo60: number
  episCaVencidos: number; treinamentosVencidos: number
  extVencidos: number; extVencendo30: number; extVencendo60: number
  condAtrasadas: number; condPendentes: number
  recursosVencidos: number; recursosVencendo30: number; recursosVencendo60: number
  monitNaoConformes: number; monitTotal: number
  avcbVigentes: number; avcbVencidos: number; avcbVencendo30: number; avcbVencendo60: number
  brigadasVencidas: number; simuladosPendentes: number
  residuosCadastrados: number; mtrEmitidos: number; destinacoesRealizadas: number
  empresasColetoras: number; certificadosDestinacao: number; coletaSeletiva: number
  pgrVencidos: number; pgrVencendo30: number; pgrVencendo60: number
  pcmsoVencidos: number; pcmsoVencendo30: number; pcmsoVencendo60: number
  ltcatVencidos: number; ltcatVencendo30: number; ltcatVencendo60: number
  pgrsVencidos: number; pgrsVencendo30: number; pgrsVencendo60: number
  ibamaPendente: number; produtosQuimicosVencidos: number
  mtrPendentes: number; certificadosPendentes: number
  episCaVencendo30: number; episCaVencendo60: number; episAbaixoMinimo: number
  episEntregues: number; episDevolvidos: number
}
interface ModuleCounts {
  totalEmpresas: number; totalColaboradores: number
  totalPGR: number; totalPCMSO: number; totalLTCAT: number
  totalEPI: number; totalEstoqueEPI: number; totalTreinamentos: number; totalComunicacoes: number
  totalExtintores: number; totalAVCB: number
  totalLicencas: number; totalCondicionantes: number; totalIBAMA: number; totalPGRS: number
  totalRecursosHidricos: number; totalResiduosMTR: number; totalColetoras: number
  totalCertificadosDest: number; totalColetaSeletiva: number; totalProdutosQuimicos: number
  totalMonitoramentos: number
}
interface Pendencia {
  id: string; descricao: string; status: string
  prazo: string | null; prioridade: string; empresa: string
}
interface Vencimento {
  id: string; tipo: string; modulo: string; categoria: 'sst' | 'ma' | 'avcb' | 'residuos'; vencimento: string | null; empresa: string
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
  'Extintor': '#f97316', 'Rec. Hídrico': '#0891b2',
}

/* ── Severidade (padrão de cores do alerta) ── */
type Severidade = 'vencido' | 'd30' | 'd60' | 'ok' | 'info'
const SEVERIDADE_STYLE: Record<Severidade, { bg: string; text: string; border: string }> = {
  vencido: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }, // vermelho — vencido/crítico
  d30:     { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' }, // laranja — vencendo em 30 dias
  d60:     { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' }, // amarelo — vencendo em 60 dias
  ok:      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, // verde — em conformidade
  info:    { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // azul — informativo
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

/* ── Alert card (Atenção Imediata) ── */
function AlertCard({ label, value, severidade, href }: { label: string; value: number; severidade: Severidade; href: string }) {
  const s = SEVERIDADE_STYLE[severidade]
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-all"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span className="text-xs font-semibold leading-snug" style={{ color: s.text }}>{label}</span>
      <span className="text-xl font-extrabold shrink-0" style={{ color: s.text }}>{value}</span>
    </Link>
  )
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

/* ── Module launcher card ── */
function ModuleCard({ href, label, count, icon: Icon, color }: {
  href: string; label: string; count: number; icon: React.ElementType; color: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl p-3 transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 36, height: 36, background: `${color}18` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-[11px] mt-0.5" style={{ color: count > 0 ? 'var(--text-muted)' : 'var(--text-muted)', opacity: count > 0 ? 1 : .7 }}>
          {count > 0 ? `${count} registro${count !== 1 ? 's' : ''}` : 'Nenhum registro'}
        </p>
      </div>
    </Link>
  )
}

/* ── Módulos do sistema — categorias (Visão Cadastro, ordem padronizada) ── */
function buildModuleCategories(m: ModuleCounts) {
  return [
    {
      title: 'Cadastros',
      modules: [
        { href: '/empresas',      label: 'Empresas e Unidades', icon: Building2, color: '#38bdf8', count: m.totalEmpresas },
        { href: '/colaboradores', label: 'Colaboradores',        icon: Users,     color: '#10b981', count: m.totalColaboradores },
      ],
    },
    {
      title: 'SST',
      modules: [
        { href: '/sst/pgr',              label: 'PGR',                 icon: ClipboardList, color: '#6366f1', count: m.totalPGR },
        { href: '/sst/pcmso',            label: 'PCMSO',               icon: ClipboardList, color: '#6366f1', count: m.totalPCMSO },
        { href: '/sst/ltcat',            label: 'LTCAT',               icon: ClipboardList, color: '#6366f1', count: m.totalLTCAT },
        { href: '/tst/epis',             label: 'EPIs',                icon: HardHat,       color: '#f97316', count: m.totalEPI },
        { href: '/tst/estoque-epi',      label: 'Estoque de EPIs',     icon: HardHat,       color: '#f97316', count: m.totalEstoqueEPI },
        { href: '/tst/treinamentos',     label: 'Treinamentos',        icon: BookOpen,      color: '#8b5cf6', count: m.totalTreinamentos },
        { href: '/tst/comunicacoes',     label: 'Comunicação SST',     icon: BookOpen,      color: '#8b5cf6', count: m.totalComunicacoes },
        { href: '/tst/extintores',       label: 'Extintores',          icon: Flame,         color: '#dc2626', count: m.totalExtintores },
        { href: '/sst/avcb/registros',   label: 'AVCB / Bombeiros',    icon: Flame,         color: '#dc2626', count: m.totalAVCB },
      ],
    },
    {
      title: 'Meio Ambiente',
      modules: [
        { href: '/meio-ambiente/licencas',                  label: 'Licenças Ambientais',        icon: TreePine,      color: '#16a34a', count: m.totalLicencas },
        { href: '/meio-ambiente/condicionantes',            label: 'Condicionantes',             icon: AlertTriangle, color: '#d97706', count: m.totalCondicionantes },
        { href: '/meio-ambiente/ibama',                     label: 'IBAMA / CTF / RAPP',         icon: Globe,         color: '#0891b2', count: m.totalIBAMA },
        { href: '/meio-ambiente/recursos-hidricos',         label: 'Recursos Hídricos',          icon: Droplets,      color: '#0891b2', count: m.totalRecursosHidricos },
        { href: '/meio-ambiente/residuos',                  label: 'Resíduos / MTR',             icon: Recycle,       color: '#dc2626', count: m.totalResiduosMTR },
        { href: '/meio-ambiente/pgrs',                      label: 'PGRS',                       icon: FileCheck2,    color: '#0891b2', count: m.totalPGRS },
        { href: '/meio-ambiente/coletoras',                 label: 'Empresas Coletoras',         icon: Truck,         color: '#16a34a', count: m.totalColetoras },
        { href: '/meio-ambiente/certificados-destinacao',   label: 'Certificados de Destinação', icon: FileCheck,     color: '#0891b2', count: m.totalCertificadosDest },
        { href: '/meio-ambiente/coleta-seletiva',           label: 'Coleta Seletiva',            icon: Recycle,       color: '#059669', count: m.totalColetaSeletiva },
        { href: '/meio-ambiente/produtos-quimicos',         label: 'Produtos Químicos / FISPQ',  icon: FlaskConical,  color: '#7c3aed', count: m.totalProdutosQuimicos },
        { href: '/meio-ambiente/monitoramentos',            label: 'Monitoramentos',             icon: Waves,         color: '#0891b2', count: m.totalMonitoramentos },
      ],
    },
  ]
}

/* ── Atenção Imediata — abas ── */
type AtencaoTab = 'geral' | 'sst' | 'ma' | 'avcb' | 'residuos'

function buildAtencaoTabs(k: Kpis) {
  return {
    geral: [
      { label: 'Pendências vencidas', value: k.pendenciasVencidas, severidade: 'vencido' as Severidade, href: '/pendencias' },
      { label: 'Pendências abertas', value: k.pendenciasAbertas, severidade: 'info' as Severidade, href: '/pendencias' },
      { label: 'EPIs vencidos', value: k.episCaVencidos, severidade: 'vencido' as Severidade, href: '/tst/estoque-epi' },
      { label: 'Treinamentos vencidos', value: k.treinamentosVencidos, severidade: 'vencido' as Severidade, href: '/tst/treinamentos' },
      { label: 'Licenças vencidas', value: k.licencasVencidas, severidade: 'vencido' as Severidade, href: '/meio-ambiente/licencas' },
      { label: 'Licenças vencendo 30 dias', value: k.licencasVencendo30, severidade: 'd30' as Severidade, href: '/meio-ambiente/licencas' },
      { label: 'Licenças vencendo 60 dias', value: k.licencasVencendo60, severidade: 'd60' as Severidade, href: '/meio-ambiente/licencas' },
      { label: 'Condicionantes atrasadas', value: k.condAtrasadas, severidade: 'vencido' as Severidade, href: '/meio-ambiente/condicionantes' },
      { label: 'Recursos hídricos vencidos', value: k.recursosVencidos, severidade: 'vencido' as Severidade, href: '/meio-ambiente/recursos-hidricos' },
      { label: 'AVCB vencidos', value: k.avcbVencidos, severidade: 'vencido' as Severidade, href: '/sst/avcb/registros' },
      { label: 'AVCB vencendo 30 dias', value: k.avcbVencendo30, severidade: 'd30' as Severidade, href: '/sst/avcb/registros' },
      { label: 'AVCB vencendo 60 dias', value: k.avcbVencendo60, severidade: 'd60' as Severidade, href: '/sst/avcb/registros' },
      { label: 'MTR pendentes', value: k.mtrPendentes, severidade: 'info' as Severidade, href: '/meio-ambiente/residuos' },
      { label: 'Certificados de destinação pendentes', value: k.certificadosPendentes, severidade: 'info' as Severidade, href: '/meio-ambiente/certificados-destinacao' },
    ],
    sst: [
      { label: 'PGR vencidos', value: k.pgrVencidos, severidade: 'vencido' as Severidade, href: '/sst/pgr' },
      { label: 'PGR vencendo 30 dias', value: k.pgrVencendo30, severidade: 'd30' as Severidade, href: '/sst/pgr' },
      { label: 'PGR vencendo 60 dias', value: k.pgrVencendo60, severidade: 'd60' as Severidade, href: '/sst/pgr' },
      { label: 'PCMSO vencidos', value: k.pcmsoVencidos, severidade: 'vencido' as Severidade, href: '/sst/pcmso' },
      { label: 'PCMSO vencendo 30 dias', value: k.pcmsoVencendo30, severidade: 'd30' as Severidade, href: '/sst/pcmso' },
      { label: 'PCMSO vencendo 60 dias', value: k.pcmsoVencendo60, severidade: 'd60' as Severidade, href: '/sst/pcmso' },
      { label: 'LTCAT vencidos', value: k.ltcatVencidos, severidade: 'vencido' as Severidade, href: '/sst/ltcat' },
      { label: 'LTCAT vencendo 30 dias', value: k.ltcatVencendo30, severidade: 'd30' as Severidade, href: '/sst/ltcat' },
      { label: 'LTCAT vencendo 60 dias', value: k.ltcatVencendo60, severidade: 'd60' as Severidade, href: '/sst/ltcat' },
      { label: 'CA de EPI vencidos', value: k.episCaVencidos, severidade: 'vencido' as Severidade, href: '/tst/estoque-epi' },
      { label: 'CA de EPI vencendo 30 dias', value: k.episCaVencendo30, severidade: 'd30' as Severidade, href: '/tst/estoque-epi' },
      { label: 'CA de EPI vencendo 60 dias', value: k.episCaVencendo60, severidade: 'd60' as Severidade, href: '/tst/estoque-epi' },
      { label: 'EPIs abaixo do estoque mínimo', value: k.episAbaixoMinimo, severidade: 'vencido' as Severidade, href: '/tst/estoque-epi' },
      { label: 'EPIs entregues', value: k.episEntregues, severidade: 'info' as Severidade, href: '/tst/epis' },
      { label: 'EPIs devolvidos', value: k.episDevolvidos, severidade: 'ok' as Severidade, href: '/tst/epis' },
      { label: 'Treinamentos vencidos', value: k.treinamentosVencidos, severidade: 'vencido' as Severidade, href: '/tst/treinamentos' },
      { label: 'Extintores vencidos', value: k.extVencidos, severidade: 'vencido' as Severidade, href: '/tst/extintores' },
      { label: 'Extintores vencendo 30 dias', value: k.extVencendo30, severidade: 'd30' as Severidade, href: '/tst/extintores' },
      { label: 'Extintores vencendo 60 dias', value: k.extVencendo60, severidade: 'd60' as Severidade, href: '/tst/extintores' },
    ],
    ma: [
      { label: 'Licenças vencidas', value: k.licencasVencidas, severidade: 'vencido' as Severidade, href: '/meio-ambiente/licencas' },
      { label: 'Licenças vencendo 30 dias', value: k.licencasVencendo30, severidade: 'd30' as Severidade, href: '/meio-ambiente/licencas' },
      { label: 'Licenças vencendo 60 dias', value: k.licencasVencendo60, severidade: 'd60' as Severidade, href: '/meio-ambiente/licencas' },
      { label: 'Condicionantes atrasadas', value: k.condAtrasadas, severidade: 'vencido' as Severidade, href: '/meio-ambiente/condicionantes' },
      { label: 'IBAMA pendente', value: k.ibamaPendente, severidade: 'vencido' as Severidade, href: '/meio-ambiente/ibama' },
      { label: 'Recursos hídricos vencidos', value: k.recursosVencidos, severidade: 'vencido' as Severidade, href: '/meio-ambiente/recursos-hidricos' },
      { label: 'Recursos hídricos vencendo 30 dias', value: k.recursosVencendo30, severidade: 'd30' as Severidade, href: '/meio-ambiente/recursos-hidricos' },
      { label: 'Recursos hídricos vencendo 60 dias', value: k.recursosVencendo60, severidade: 'd60' as Severidade, href: '/meio-ambiente/recursos-hidricos' },
      { label: 'Produtos químicos/FISPQ vencidos', value: k.produtosQuimicosVencidos, severidade: 'vencido' as Severidade, href: '/meio-ambiente/produtos-quimicos' },
    ],
    avcb: [
      { label: 'AVCB vigentes', value: k.avcbVigentes, severidade: 'ok' as Severidade, href: '/sst/avcb/registros' },
      { label: 'AVCB vencidos', value: k.avcbVencidos, severidade: 'vencido' as Severidade, href: '/sst/avcb/registros' },
      { label: 'AVCB vencendo 30 dias', value: k.avcbVencendo30, severidade: 'd30' as Severidade, href: '/sst/avcb/registros' },
      { label: 'AVCB vencendo 60 dias', value: k.avcbVencendo60, severidade: 'd60' as Severidade, href: '/sst/avcb/registros' },
      { label: 'Brigadas vencidas', value: k.brigadasVencidas, severidade: 'vencido' as Severidade, href: '/sst/avcb/brigada' },
      { label: 'Simulados pendentes', value: k.simuladosPendentes, severidade: 'info' as Severidade, href: '/sst/avcb/simulados' },
    ],
    residuos: [
      { label: 'Resíduos cadastrados', value: k.residuosCadastrados, severidade: 'info' as Severidade, href: '/meio-ambiente/residuos' },
      { label: 'MTR emitidos', value: k.mtrEmitidos, severidade: 'ok' as Severidade, href: '/meio-ambiente/residuos' },
      { label: 'Destinações realizadas', value: k.destinacoesRealizadas, severidade: 'ok' as Severidade, href: '/meio-ambiente/residuos' },
      { label: 'Empresas coletoras', value: k.empresasColetoras, severidade: 'info' as Severidade, href: '/meio-ambiente/coletoras' },
      { label: 'Certificados de destinação', value: k.certificadosDestinacao, severidade: 'info' as Severidade, href: '/meio-ambiente/certificados-destinacao' },
      { label: 'Coleta seletiva', value: k.coletaSeletiva, severidade: 'info' as Severidade, href: '/meio-ambiente/coleta-seletiva' },
      { label: 'PGRS vencidos', value: k.pgrsVencidos, severidade: 'vencido' as Severidade, href: '/meio-ambiente/pgrs' },
      { label: 'PGRS vencendo 30 dias', value: k.pgrsVencendo30, severidade: 'd30' as Severidade, href: '/meio-ambiente/pgrs' },
      { label: 'PGRS vencendo 60 dias', value: k.pgrsVencendo60, severidade: 'd60' as Severidade, href: '/meio-ambiente/pgrs' },
    ],
  }
}

const ATENCAO_TAB_LABELS: { key: AtencaoTab; label: string }[] = [
  { key: 'geral', label: 'Geral' },
  { key: 'sst', label: 'SST' },
  { key: 'ma', label: 'Meio Ambiente' },
  { key: 'avcb', label: 'AVCB / Bombeiros' },
  { key: 'residuos', label: 'Resíduos' },
]

/* ── Main ── */
export function DashboardClient({ kpis, pendencias, vencimentos, empresas, moduleCounts }: {
  kpis: Kpis; pendencias: Pendencia[]; vencimentos: Vencimento[]; empresas: EmpresaSaude[]; moduleCounts: ModuleCounts
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const [atencaoTab, setAtencaoTab] = useState<AtencaoTab>('geral')

  const moduleCategories = buildModuleCategories(moduleCounts)
  const atencaoTabs = buildAtencaoTabs(kpis)

  // Gráficos baseados nos prazos/vencimentos reais da aba de Atenção Imediata selecionada
  const cardsAbaAtiva = atencaoTabs[atencaoTab]
  const somaSeveridade = (sev: Severidade) => cardsAbaAtiva.filter(c => c.severidade === sev).reduce((acc, c) => acc + c.value, 0)
  const barData = [somaSeveridade('vencido'), somaSeveridade('d30'), somaSeveridade('d60')]
  const CHART_CATEGORIES = ['Vencidos', 'Vencendo 30d', 'Vencendo 60d']
  const CHART_COLORS = ['#dc2626', '#ea580c', '#ca8a04']

  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    plotOptions: { bar: { borderRadius: 5, columnWidth: '50%', distributed: true } },
    legend: { show: false },
    dataLabels: { enabled: false },
    xaxis: {
      categories: CHART_CATEGORIES,
      labels: { style: { colors: textColor, fontSize: '11px', fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: textColor, fontSize: '11px' } } },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    colors: CHART_COLORS,
    tooltip: { theme: isDark ? 'dark' : 'light' },
    theme: { mode: isDark ? 'dark' : 'light' },
  }

  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
    labels: CHART_CATEGORIES,
    colors: CHART_COLORS,
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
  const printedAt = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // Próximos Vencimentos filtrados pela aba de Atenção Imediata selecionada
  const vencimentosFiltrados = (atencaoTab === 'geral' ? vencimentos : vencimentos.filter(v => v.categoria === atencaoTab)).slice(0, 8)
  const abaAtualLabel = ATENCAO_TAB_LABELS.find(t => t.key === atencaoTab)?.label ?? 'Geral'

  return (
    <div className="dashboard-print-area" style={{ maxWidth: 1400 }}>
      {/* Print-only header (visível apenas na impressão) */}
      <div className="print-only" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Dashboard Executivo — GestãoTST</h1>
        <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Impresso em {printedAt}</p>
      </div>

      {/* Page title */}
      <div className="no-print mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Visão executiva · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Printer size={14} />
          Imprimir Dashboard
        </button>
      </div>

      {/* Módulos do sistema — grade de acesso rápido por categoria */}
      {moduleCategories.map(cat => (
        <div key={cat.title} className="mb-6">
          <RowLabel label={cat.title} />
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {cat.modules.map(mod => (
              <ModuleCard key={mod.href} href={mod.href} label={mod.label} count={mod.count} icon={mod.icon} color={mod.color} />
            ))}
          </div>
        </div>
      ))}

      {/* Atenção imediata — abas por área */}
      <RowLabel label="Atenção imediata" />
      <div className="no-print flex items-center gap-1.5 mb-4 flex-wrap">
        {ATENCAO_TAB_LABELS.map(t => (
          <button
            key={t.key}
            onClick={() => setAtencaoTab(t.key)}
            className="rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all"
            style={{
              background: atencaoTab === t.key ? 'var(--brand-gradient)' : 'var(--bg-card)',
              color: atencaoTab === t.key ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tela: apenas a aba ativa. Impressão: todas as abas, uma após a outra (via CSS print-force-block). */}
      {ATENCAO_TAB_LABELS.map(t => (
        <div key={t.key} className="print-force-block" style={{ display: atencaoTab === t.key ? 'block' : 'none' }}>
          <p className="print-only" style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: '14px 0 8px' }}>{t.label}</p>
          <div className="grid gap-2.5 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {atencaoTabs[t.key].map(card => (
              <AlertCard key={card.label} label={card.label} value={card.value} severidade={card.severidade} href={card.href} />
            ))}
          </div>
        </div>
      ))}

      {/* Charts */}
      <RowLabel label="Análises" />
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <Section title="Itens por Módulo" sub={`Vencidos e vencendo · ${abaAtualLabel}`} />
          <ApexChart type="bar" options={barOptions} series={[{ name: 'Itens', data: barData }]} height={180} />
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <Section title="Distribuição" sub={`Vencidos vs. vencendo · ${abaAtualLabel}`} />
          <ApexChart type="donut" options={donutOptions} series={barData.map(v => Math.max(v, 0))} height={180} />
        </div>
      </div>

      {/* Saúde por Empresa */}
      {empresas.length > 0 && (
        <div className="rounded-xl mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 pt-5 pb-3">
            <Section title="Saúde por Empresa" sub="Itens críticos por empresa ativa"
              action={<Link href="/empresas" className="no-print text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver todas →</Link>} />
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
              action={<Link href="/pendencias" className="no-print text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver todas →</Link>} />
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

        {/* Próximos vencimentos — multi-módulo, filtrado pela aba de Atenção Imediata */}
        <div className="rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 pt-5 pb-3">
            <Section title="Próximos Vencimentos" sub={`Vencidos e vencendo em até 60 dias · ${abaAtualLabel}`}
              action={<Link href="/relatorios" className="no-print text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Relatórios →</Link>} />
          </div>
          <div>
            {vencimentosFiltrados.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>✅ Nenhum vencimento próximo</div>
            ) : (
              vencimentosFiltrados.map((v) => {
                const dias = diasPara(v.vencimento)
                const vencido = dias !== null && dias < 0
                const s = vencido ? SEVERIDADE_STYLE.vencido : dias !== null && dias <= 30 ? SEVERIDADE_STYLE.d30 : SEVERIDADE_STYLE.d60
                const mc = MODULO_COLOR[v.modulo] ?? '#64748b'
                return (
                  <div key={v.id + v.modulo} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.text }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span style={{ fontSize: 9, fontWeight: 700, color: mc, background: mc + '18', padding: '1px 6px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '.3px' }}>{v.modulo}</span>
                      </div>
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{v.tipo}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{v.empresa} · {fmt(v.vencimento)}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg shrink-0" style={{ background: s.bg, color: s.text }}>
                      {dias === null ? '—' : vencido ? 'Vencido' : `${dias}d`}
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
