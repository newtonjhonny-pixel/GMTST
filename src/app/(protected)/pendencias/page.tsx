import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ABERTA:       { bg: '#eff6ff', text: '#3b82f6', dot: '#3b82f6', label: 'Aberta' },
  EM_ANDAMENTO: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', label: 'Em andamento' },
  VENCIDA:      { bg: '#fef2f2', text: '#ef4444', dot: '#ef4444', label: 'Vencida' },
  CONCLUIDA:    { bg: '#f0fdf4', text: '#16a34a', dot: '#10b981', label: 'Concluída' },
}
const PRIORIDADE: Record<string, { color: string; label: string }> = {
  CRITICA: { color: '#ef4444', label: 'Crítica' },
  ALTA:    { color: '#f97316', label: 'Alta' },
  MEDIA:   { color: '#f59e0b', label: 'Média' },
  BAIXA:   { color: '#10b981', label: 'Baixa' },
}

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}
function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default async function PendenciasPage() {
  const pendencias = await prisma.pendencia.findMany({
    include: { empresa: { select: { razaoSocial: true } }, responsavel: { select: { name: true } } },
    orderBy: [{ prioridade: 'desc' }, { prazo: 'asc' }],
  })

  const grupos = {
    VENCIDA:      pendencias.filter(p => p.status === 'VENCIDA'),
    ABERTA:       pendencias.filter(p => p.status === 'ABERTA'),
    EM_ANDAMENTO: pendencias.filter(p => p.status === 'EM_ANDAMENTO'),
    CONCLUIDA:    pendencias.filter(p => p.status === 'CONCLUIDA'),
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Pendências / Plano de Ação
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {pendencias.length} item{pendencias.length !== 1 ? 's' : ''} &middot;&nbsp;
            <span style={{ color: '#ef4444', fontWeight: 600 }}>{grupos.VENCIDA.length} vencida{grupos.VENCIDA.length !== 1 ? 's' : ''}</span>
            &nbsp;&middot;&nbsp;{grupos.ABERTA.length} aberta{grupos.ABERTA.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/pendencias/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Pendência
        </Link>
      </div>

      {/* Kanban board */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {(Object.entries(grupos) as [string, typeof pendencias][]).map(([status, items]) => {
          const s = STATUS[status]
          return (
            <div key={status}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.dot }} />
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.label}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
                  style={{ background: 'var(--bg-card-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  {items.length}
                </span>
              </div>

              {/* Column */}
              <div
                className="rounded-xl p-2 flex flex-col gap-2"
                style={{
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border)',
                  minHeight: 400,
                }}
              >
                {items.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-10">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nenhuma</p>
                  </div>
                )}
                {items.map(p => {
                  const pr = PRIORIDADE[p.prioridade] ?? PRIORIDADE.BAIXA
                  const dias = diasPara(p.prazo)
                  const daysColor = dias === null ? '#94a3b8' : dias < 0 ? '#ef4444' : dias <= 7 ? '#f97316' : dias <= 15 ? '#f59e0b' : '#10b981'
                  const daysBg   = dias === null ? 'var(--bg-card-alt)' : dias < 0 ? '#fef2f2' : dias <= 7 ? '#fff7ed' : dias <= 15 ? '#fffbeb' : '#f0fdf4'
                  return (
                    <div
                      key={p.id}
                      className="rounded-lg p-3 transition-all"
                      style={{
                        background: 'var(--bg-card)',
                        border: status === 'VENCIDA' ? '1px solid #fecaca' : '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {/* Priority dot + title */}
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: pr.color }} />
                        <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                          {p.descricao}
                        </p>
                      </div>

                      {/* Company */}
                      <p className="text-[10px] mb-2 pl-4" style={{ color: 'var(--text-muted)' }}>
                        {p.empresa.razaoSocial}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-1.5 pl-4 flex-wrap">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: pr.color + '18', color: pr.color }}
                        >
                          {pr.label}
                        </span>
                        {dias !== null && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: daysBg, color: daysColor }}
                          >
                            {dias < 0 ? `−${Math.abs(dias)}d` : `${dias}d`}
                          </span>
                        )}
                        <span className="text-[9px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                          {fmt(p.prazo)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
