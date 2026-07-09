import { prisma } from '@/lib/prisma'
import { formatCNPJ } from '@/lib/utils'
import { Building2, Plus, MapPin, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVO:     { bg: '#f0fdf4', text: '#16a34a', label: 'Ativa' },
  INATIVO:   { bg: '#fef2f2', text: '#dc2626', label: 'Inativa' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivada' },
}

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    include: {
      _count: { select: { unidades: true, pendencias: true } },
      pendencias: { where: { status: { in: ['ABERTA', 'VENCIDA'] } }, select: { id: true } },
      unidades: { select: { _count: { select: { colaboradores: true } } } },
    },
    orderBy: { razaoSocial: 'asc' },
  })

  const totalAtivas = empresas.filter(e => e.status === 'ATIVO').length

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Empresas e Unidades
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''} &middot; {totalAtivas} ativa{totalAtivas !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/empresas/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Empresa
        </Link>
      </div>

      {/* Cards grid */}
      {empresas.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-20"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Building2 size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa cadastrada</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Clique em &quot;Nova Empresa&quot; para começar</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {empresas.map(e => {
            const ss = STATUS_STYLE[e.status] ?? STATUS_STYLE.INATIVO
            const pendCount = e.pendencias.length
            return (
              <div
                key={e.id}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Top accent */}
                <div style={{ height: 3, background: 'var(--brand-gradient)' }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="flex items-center justify-center rounded-xl text-white font-black text-base shrink-0"
                      style={{ width: 40, height: 40, background: 'var(--brand-gradient)' }}
                    >
                      {e.razaoSocial[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {e.razaoSocial}
                      </p>
                      <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                        {formatCNPJ(e.cnpj)}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: ss.bg, color: ss.text }}
                    >
                      {ss.label}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-card-alt)' }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MapPin size={10} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                        {e._count.unidades}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Unidades
                      </p>
                    </div>
                    <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-card-alt)' }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users size={10} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                        {e.unidades.reduce((s, u) => s + u._count.colaboradores, 0)}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Colab.
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-2.5 text-center"
                      style={{ background: pendCount > 0 ? 'var(--danger-bg)' : 'var(--bg-card-alt)' }}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <AlertTriangle size={10} style={{ color: pendCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />
                      </div>
                      <p
                        className="text-lg font-extrabold"
                        style={{ color: pendCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}
                      >
                        {pendCount}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Pendências
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Cód. {e.codigo}
                    </p>
                    <Link
                      href={`/empresas/${e.id}`}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: 'var(--bg-app)', color: 'var(--brand-from)', border: '1px solid var(--border)' }}
                    >
                      Ver detalhes →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add new card */}
          <Link
            href="/empresas/nova"
            className="rounded-xl flex flex-col items-center justify-center gap-3 py-12 transition-all"
            style={{
              background: 'var(--bg-card-alt)',
              border: '2px dashed var(--border)',
              minHeight: 220,
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 40, height: 40, background: 'var(--bg-app)', border: '1px solid var(--border)' }}
            >
              <Plus size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Adicionar empresa</p>
          </Link>
        </div>
      )}
    </div>
  )
}
