'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'
import { CATEGORIAS_DOCUMENTO_PADRAO } from '@/lib/anexos-categorias'

const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:      { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:  { bg: '#eff6ff', text: '#2563eb' },
  SUBSTITUIR: { bg: '#fffbeb', text: '#d97706' },
  EXCLUIR:    { bg: '#fef2f2', text: '#dc2626' },
  VISUALIZAR: { bg: '#f1f5f9', text: '#475569' },
  BAIXAR:     { bg: '#f1f5f9', text: '#475569' },
}

type ProdutoDetail = {
  id: string; nome: string; cas: string | null; fornecedor: string | null
  fispq: string | null; riscos: string[]; armazenagem: string | null
  epi: string[]; observacao: string | null
  empresa: { razaoSocial: string } | null
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ProdutoQuimicoDetailTabs({ produto, historico }: { produto: ProdutoDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/produtos-quimicos" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            {produto.nome}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {produto.empresa ? produto.empresa.razaoSocial : 'Sem empresa vinculada'}
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
            <InfoField label="Nome / Produto" value={produto.nome} />
            <InfoField label="Empresa" value={produto.empresa ? produto.empresa.razaoSocial : '—'} />
            <InfoField label="CAS" value={produto.cas ?? '—'} />
            <InfoField label="Fornecedor" value={produto.fornecedor ?? '—'} />
            <InfoField
              label="FISPQ"
              value={produto.fispq
                ? <a href={produto.fispq} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: 'var(--brand-from)' }}>Ver FISPQ</a>
                : '—'}
            />
          </InfoGrid>

          <InfoSectionLabel>Riscos e EPIs</InfoSectionLabel>
          <InfoGrid>
            <InfoField
              label="Riscos"
              value={produto.riscos.length > 0
                ? <div className="flex flex-wrap gap-1">{produto.riscos.map(r => <Pill key={r} color="#dc2626" bg="#fef2f2">{r}</Pill>)}</div>
                : '—'}
            />
            <InfoField
              label="EPIs Necessários"
              value={produto.epi.length > 0
                ? <div className="flex flex-wrap gap-1">{produto.epi.map(e => <Pill key={e} color="#2563eb" bg="#eff6ff">{e}</Pill>)}</div>
                : '—'}
            />
            <InfoField label="Armazenagem" value={produto.armazenagem ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: produto.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {produto.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="PRODUTO_QUIMICO" entidadeId={produto.id} tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
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
