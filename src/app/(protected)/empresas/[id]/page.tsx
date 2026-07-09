import { prisma } from '@/lib/prisma'
import { formatCNPJ } from '@/lib/utils'
import { Building2, Plus, MapPin, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVO:     { bg: '#f0fdf4', text: '#16a34a', label: 'Ativa' },
  INATIVO:   { bg: '#fef2f2', text: '#dc2626', label: 'Inativa' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivada' },
}

export default async function EmpresaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      unidades: { orderBy: { nome: 'asc' }, include: { _count: { select: { colaboradores: true } } } },
      _count: { select: { pendencias: true, certificacoes: true, taxas: true, documentosLegais: true } },
    },
  })

  if (!empresa) notFound()

  const ss = STATUS_STYLE[empresa.status] ?? STATUS_STYLE.INATIVO
  const totalColaboradores = empresa.unidades.reduce((s, u) => s + u._count.colaboradores, 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/empresas" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div
          className="flex items-center justify-center rounded-xl text-white font-black text-base shrink-0"
          style={{ width: 40, height: 40, background: 'var(--brand-gradient)' }}
        >
          {empresa.razaoSocial[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {empresa.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>
              {ss.label}
            </span>
          </div>
          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
            Cód. {empresa.codigo} &middot; {formatCNPJ(empresa.cnpj)}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {[
          { label: 'Unidades', value: empresa.unidades.length, icon: MapPin },
          { label: 'Colaboradores', value: totalColaboradores, icon: Users },
          { label: 'Pendências', value: empresa._count.pendencias, icon: Building2 },
          { label: 'Certificações', value: empresa._count.certificacoes, icon: Building2 },
          { label: 'Taxas', value: empresa._count.taxas, icon: Building2 },
          { label: 'Documentos', value: empresa._count.documentosLegais, icon: Building2 },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Unidades */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Unidades</h2>
        <Link
          href={`/empresas/unidades/nova?empresaId=${empresa.id}`}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={12} />
          Nova Unidade
        </Link>
      </div>

      {empresa.unidades.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-16"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <MapPin size={32} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma unidade cadastrada</p>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {empresa.unidades.map(u => {
            const uss = STATUS_STYLE[u.status] ?? STATUS_STYLE.INATIVO
            return (
              <div key={u.id} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{u.nome}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: uss.bg, color: uss.text }}>{uss.label}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.cidade}/{u.uf}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{u._count.colaboradores} colaborador{u._count.colaboradores !== 1 ? 'es' : ''}</p>
                {(u.responsavelTST || u.responsavelMeioAmb) && (
                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    {u.responsavelTST && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>TST: {u.responsavelTST}</p>}
                    {u.responsavelMeioAmb && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Meio Amb.: {u.responsavelMeioAmb}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
