import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FiltroRelatorio } from '@/components/relatorios/FiltroRelatorio'

function KPI({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${color ? color + '33' : 'var(--border)'}`, borderRadius: 12, padding: '18px 22px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: color ?? 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function Secao({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>{children}</div>
    </div>
  )
}

function TabelaMaterial({ rows }: { rows: { material: string; total: number; unidade: string }[] }) {
  if (rows.length === 0) return <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sem registros</p>
  const LABEL: Record<string, string> = {
    PAPEL: 'Papel', PLASTICO: 'Plástico', VIDRO: 'Vidro', METAL: 'Metal',
    ORGANICO: 'Orgânico', REJEITO: 'Rejeito', ELETRONICO: 'Eletrônico', OUTRO: 'Outro',
  }
  return (
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.4px' }}>Material</th>
            <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.4px' }}>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.material} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>{LABEL[r.material] ?? r.material}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>{r.total.toFixed(2)} {r.unidade || 'kg'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function RelatorioMAPage({ searchParams }: { searchParams: Promise<{ empresaId?: string; ano?: string }> }) {
  const { empresaId, ano: anoStr } = await searchParams
  const ano  = parseInt(anoStr ?? String(new Date().getFullYear()))
  const ini  = new Date(ano, 0, 1)
  const fim  = new Date(ano, 11, 31, 23, 59, 59)
  const hoje = new Date()

  const where = empresaId ? { empresaId } : {}

  const [
    licencasVigentes, licencasVencidas, licencasAVencer,
    condTotais, condEmDia, condAtrasadas, condPendentes,
    certTotal, certPeriodo,
    coletasRaw,
    recursosTotal, recursosVencidos, recursosAVencer,
    pgrsTotal, pgrsAtivos, pgrsVencidos,
    monitTotal, monitConformes, monitNaoConformes,
  ] = await Promise.all([
    prisma.licencaAmbiental.count({ where: { ...where, status: 'VIGENTE' } }),
    prisma.licencaAmbiental.count({ where: { ...where, vencimento: { lt: hoje } } }),
    prisma.licencaAmbiental.count({ where: { ...where, vencimento: { gte: hoje, lte: new Date(hoje.getTime() + 60 * 86400000) } } }),

    prisma.condicionante.count({ where: { licenca: { ...where } } }),
    prisma.condicionante.count({ where: { licenca: { ...where }, status: 'EM_DIA' } }),
    prisma.condicionante.count({ where: { licenca: { ...where }, status: 'ATRASADA' } }),
    prisma.condicionante.count({ where: { licenca: { ...where }, status: 'PENDENTE' } }),

    prisma.certificadoDestinacao.count({ where }),
    prisma.certificadoDestinacao.count({ where: { ...where, dataEmissao: { gte: ini, lte: fim } } }),

    prisma.coletaSeletiva.groupBy({ by: ['material'], where: { ...where, data: { gte: ini, lte: fim } }, _sum: { quantidade: true } }),

    prisma.recursoHidrico.count({ where }),
    prisma.recursoHidrico.count({ where: { ...where, vencimento: { lt: hoje } } }),
    prisma.recursoHidrico.count({ where: { ...where, vencimento: { gte: hoje, lte: new Date(hoje.getTime() + 60 * 86400000) } } }),

    prisma.pGRSAmbiental.count({ where }),
    prisma.pGRSAmbiental.count({ where: { ...where, status: 'ATIVO' } }),
    prisma.pGRSAmbiental.count({ where: { ...where, dataVigencia: { lt: hoje } } }),

    prisma.monitoramentoAmbiental.count({ where }),
    prisma.monitoramentoAmbiental.count({ where: { ...where, conformidade: true } }),
    prisma.monitoramentoAmbiental.count({ where: { ...where, conformidade: false } }),
  ])

  const coletasRows = coletasRaw
    .sort((a, b) => (b._sum.quantidade ?? 0) - (a._sum.quantidade ?? 0))
    .map(r => ({ material: r.material, total: r._sum.quantidade ?? 0, unidade: 'kg' }))

  const taxaConformidade = monitTotal > 0 ? ((monitConformes / monitTotal) * 100).toFixed(1) : '—'

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 print:hidden">
        <Link href="/relatorios" style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Indicadores Meio Ambiente</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Gestão Ambiental — ano {ano}</p>
        </div>
      </div>

      <div className="print:hidden">
        <Suspense><FiltroRelatorio /></Suspense>
      </div>

      <div className="print:block hidden mb-4">
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Relatório de Indicadores Meio Ambiente — {ano}</h1>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Gerado em {new Date().toLocaleDateString('pt-BR')} · GMTST</p>
      </div>

      <Secao title="Licenças Ambientais">
        <KPI label="Vigentes" value={licencasVigentes} color="#16a34a" />
        <KPI label="Vencidas" value={licencasVencidas} color={licencasVencidas > 0 ? '#dc2626' : undefined} />
        <KPI label="A Vencer em 60d" value={licencasAVencer} color={licencasAVencer > 0 ? '#d97706' : undefined} />
      </Secao>

      <Secao title="Condicionantes">
        <KPI label="Total" value={condTotais} />
        <KPI label="Em Dia" value={condEmDia} color="#16a34a" />
        <KPI label="Atrasadas" value={condAtrasadas} color={condAtrasadas > 0 ? '#dc2626' : undefined} />
        <KPI label="Pendentes" value={condPendentes} color={condPendentes > 0 ? '#d97706' : undefined} />
      </Secao>

      <Secao title="Certificados de Destinação">
        <KPI label="Total" value={certTotal} />
        <KPI label={`Emitidos em ${ano}`} value={certPeriodo} color={certPeriodo === 0 ? '#d97706' : '#16a34a'} />
      </Secao>

      <Secao title="Recursos Hídricos — Outorgas">
        <KPI label="Total" value={recursosTotal} />
        <KPI label="Vencidos" value={recursosVencidos} color={recursosVencidos > 0 ? '#dc2626' : undefined} />
        <KPI label="A Vencer em 60d" value={recursosAVencer} color={recursosAVencer > 0 ? '#d97706' : undefined} />
        <KPI label="Em Dia" value={recursosTotal - recursosVencidos - recursosAVencer} color="#16a34a" />
      </Secao>

      <Secao title="PGRS — Plano de Gerenciamento de Resíduos">
        <KPI label="Total de PGRS" value={pgrsTotal} />
        <KPI label="Ativos" value={pgrsAtivos} color="#16a34a" />
        <KPI label="Com Vigência Vencida" value={pgrsVencidos} color={pgrsVencidos > 0 ? '#d97706' : undefined} />
      </Secao>

      <Secao title="Monitoramentos Ambientais">
        <KPI label="Total" value={monitTotal} />
        <KPI label="Conformes" value={monitConformes} color="#16a34a" />
        <KPI label="Não Conformes" value={monitNaoConformes} color={monitNaoConformes > 0 ? '#dc2626' : undefined} />
        <KPI label="Taxa de Conformidade" value={`${taxaConformidade}%`} color={monitNaoConformes > 0 ? '#d97706' : '#16a34a'} />
      </Secao>

      {coletasRows.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Coleta Seletiva — {ano}</h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <TabelaMaterial rows={coletasRows} />
          </div>
        </div>
      )}
    </div>
  )
}
