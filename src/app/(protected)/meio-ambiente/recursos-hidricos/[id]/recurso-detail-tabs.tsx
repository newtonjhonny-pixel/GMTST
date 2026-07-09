'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'
import { CATEGORIAS_DOCUMENTO_PADRAO } from '@/lib/anexos-categorias'

const TIPO_INFO: Record<string, { label: string; color: string; bg: string }> = {
  OUTORGA_CAPTACAO:    { label: 'Outorga Captação',   color: '#185FA5', bg: '#E6F1FB' },
  OUTORGA_LANCAMENTO:  { label: 'Outorga Lançamento', color: '#7c3aed', bg: '#f5f3ff' },
  POCO_ARTESIANO:      { label: 'Poço Artesiano',     color: '#0891b2', bg: '#ecfeff' },
  EFLUENTE_TRATADO:    { label: 'Efluente Tratado',   color: '#16a34a', bg: '#f0fdf4' },
  AGUA_REUSO:          { label: 'Água de Reúso',      color: '#d97706', bg: '#fffbeb' },
}
const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:      { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:  { bg: '#eff6ff', text: '#2563eb' },
  SUBSTITUIR: { bg: '#fffbeb', text: '#d97706' },
  EXCLUIR:    { bg: '#fef2f2', text: '#dc2626' },
  VISUALIZAR: { bg: '#f1f5f9', text: '#475569' },
  BAIXAR:     { bg: '#f1f5f9', text: '#475569' },
}

type RecursoDetail = {
  id: string; tipo: string; numeroOutorga: string | null; orgaoOtorgante: string | null
  emissao: string | null; vencimento: string | null; vazaoAutorizada: number | null
  unidadeMedida: string | null; finalidade: string | null; responsavel: string | null
  status: string; observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function RecursoHidricoDetailTabs({ recurso, historico }: { recurso: RecursoDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const ti = TIPO_INFO[recurso.tipo] ?? { label: recurso.tipo, color: '#64748b', bg: '#f8fafc' }
  const ativo = recurso.status === 'ATIVO'

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/recursos-hidricos" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {ti.label} — {recurso.empresa.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ativo ? '#f0fdf4' : '#f8fafc', color: ativo ? '#16a34a' : '#64748b' }}>
              {ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {recurso.unidade.nome} — {recurso.unidade.cidade}/{recurso.unidade.uf}
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
            <InfoField label="Empresa" value={recurso.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${recurso.unidade.nome} — ${recurso.unidade.cidade}/${recurso.unidade.uf}`} />
            <InfoField label="Tipo" value={<Pill color={ti.color} bg={ti.bg}>{ti.label}</Pill>} />
            <InfoField label="Status" value={<Pill color={ativo ? '#16a34a' : '#64748b'} bg={ativo ? '#f0fdf4' : '#f8fafc'}>{ativo ? 'Ativo' : 'Inativo'}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Outorga</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Nº Outorga" value={recurso.numeroOutorga ?? '—'} />
            <InfoField label="Órgão Outorgante" value={recurso.orgaoOtorgante ?? '—'} />
            <InfoField label="Data de Emissão" value={fmt(recurso.emissao)} />
            <InfoField label="Data de Vencimento" value={fmt(recurso.vencimento)} />
            <InfoField label="Vazão Autorizada" value={recurso.vazaoAutorizada != null ? `${recurso.vazaoAutorizada} ${recurso.unidadeMedida ?? ''}` : '—'} />
            <InfoField label="Finalidade" value={recurso.finalidade ?? '—'} />
            <InfoField label="Responsável" value={recurso.responsavel ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: recurso.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {recurso.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="RECURSO_HIDRICO" entidadeId={recurso.id} tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
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
