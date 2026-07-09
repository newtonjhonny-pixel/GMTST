'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'
import { CATEGORIAS_DOCUMENTO_PADRAO } from '@/lib/anexos-categorias'

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PENDENTE:  { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
  EM_DIA:    { bg: '#f0fdf4', text: '#16a34a', label: 'Em dia' },
  ATRASADA:  { bg: '#fef2f2', text: '#dc2626', label: 'Atrasada' },
  CONCLUIDA: { bg: '#f1f5f9', text: '#475569', label: 'Concluída' },
}
const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:      { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:  { bg: '#eff6ff', text: '#2563eb' },
  SUBSTITUIR: { bg: '#fffbeb', text: '#d97706' },
  EXCLUIR:    { bg: '#fef2f2', text: '#dc2626' },
  VISUALIZAR: { bg: '#f1f5f9', text: '#475569' },
  BAIXAR:     { bg: '#f1f5f9', text: '#475569' },
}

type CondicionanteDetail = {
  id: string; descricao: string; prazo: string | null; periodicidade: string | null
  responsavel: string | null; evidencia: string | null; status: string; observacao: string | null
  licenca: { tipo: string; orgao: string; empresa: { razaoSocial: string }; unidade: { nome: string; cidade: string; uf: string } }
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function CondicionanteDetailTabs({ condicionante, historico }: { condicionante: CondicionanteDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const ss = STATUS_STYLE[condicionante.status] ?? STATUS_STYLE.PENDENTE

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/condicionantes" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>{condicionante.descricao}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {condicionante.licenca.empresa.razaoSocial} · {condicionante.licenca.tipo} — {condicionante.licenca.orgao}
          </p>
        </div>
      </div>

      <DetailTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'dados', label: 'Dados Gerais', icon: ClipboardList },
          { key: 'documentos', label: 'Documentos', icon: FileText },
          { key: 'historico', label: 'Histórico', icon: HistoryIcon },
        ]}
      />

      {tab === 'dados' && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <InfoSectionLabel>Identificação</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Empresa" value={condicionante.licenca.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${condicionante.licenca.unidade.nome} — ${condicionante.licenca.unidade.cidade}/${condicionante.licenca.unidade.uf}`} />
            <InfoField label="Licença Vinculada" value={`${condicionante.licenca.tipo} — ${condicionante.licenca.orgao}`} />
            <InfoField label="Status" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Dados da Condicionante</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Descrição" value={condicionante.descricao} />
            <InfoField label="Prazo" value={fmt(condicionante.prazo)} />
            <InfoField label="Periodicidade" value={condicionante.periodicidade ?? '—'} />
            <InfoField label="Responsável" value={condicionante.responsavel ?? '—'} />
            <InfoField label="Evidência" value={condicionante.evidencia ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: condicionante.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {condicionante.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="CONDICIONANTE" entidadeId={condicionante.id} tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
      )}

      {tab === 'historico' && (
        historico.length === 0 ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <HistoryIcon size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Nenhum evento registrado</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {historico.map((h, i) => {
              const ac = ACAO_STYLE[h.acao] ?? { bg: 'var(--bg-card-alt)', text: 'var(--text-secondary)' }
              return (
                <div key={h.id} className="flex items-center justify-between px-5 py-3" style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: ac.bg, color: ac.text }}>{h.acao}</span>
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{h.descricao ?? '—'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{fmtDateTime(h.createdAt)}</p>
                    {h.usuario && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{h.usuario}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
