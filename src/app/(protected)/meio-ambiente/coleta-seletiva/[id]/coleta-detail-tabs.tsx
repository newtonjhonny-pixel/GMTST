'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'

const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:     { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR: { bg: '#eff6ff', text: '#2563eb' },
}

const TIPOS_DOCUMENTO_COLETA = ['Relatórios', 'Fotografias', 'Comprovantes', 'Outros']

const MAT_INFO: Record<string, { label: string; color: string; bg: string }> = {
  PAPEL:      { label: 'Papel',      color: '#185FA5', bg: '#E6F1FB' },
  PLASTICO:   { label: 'Plástico',   color: '#d97706', bg: '#fffbeb' },
  VIDRO:      { label: 'Vidro',      color: '#0891b2', bg: '#ecfeff' },
  METAL:      { label: 'Metal',      color: '#64748b', bg: '#f1f5f9' },
  ORGANICO:   { label: 'Orgânico',   color: '#16a34a', bg: '#f0fdf4' },
  MADEIRA:    { label: 'Madeira',    color: '#92400e', bg: '#fef3c7' },
  ELETRONICO: { label: 'Eletrônico', color: '#7c3aed', bg: '#f5f3ff' },
  PILHAS:     { label: 'Pilhas',     color: '#be123c', bg: '#fff1f2' },
  LAMPADAS:   { label: 'Lâmpadas',   color: '#0369a1', bg: '#e0f2fe' },
  REJEITO:    { label: 'Rejeito',    color: '#dc2626', bg: '#fef2f2' },
  OUTRO:      { label: 'Outro',      color: '#64748b', bg: '#f8fafc' },
}

type ColetaDetail = {
  id: string
  local: string | null
  responsavel: string | null
  frequencia: string | null
  data: string
  material: string
  quantidade: number
  peso: number | null
  unidadeMedida: string
  destinacao: string | null
  observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
  coletor: { razaoSocial: string } | null
}

type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ColetaDetailTabs({ reg, historico }: { reg: ColetaDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const mat = MAT_INFO[reg.material] ?? MAT_INFO.OUTRO

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/coleta-seletiva" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              Coleta de {mat.label} — {reg.empresa.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: mat.bg, color: mat.color }}>
              {mat.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {reg.unidade.nome} — {reg.unidade.cidade}/{reg.unidade.uf} · {fmt(reg.data)}
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
            <InfoField label="Empresa" value={reg.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${reg.unidade.nome} — ${reg.unidade.cidade}/${reg.unidade.uf}`} />
            <InfoField label="Local" value={reg.local ?? '—'} />
            <InfoField label="Responsável" value={reg.responsavel ?? '—'} />
            <InfoField label="Frequência" value={reg.frequencia ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Dados da Coleta</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Data" value={fmt(reg.data)} />
            <InfoField label="Material" value={<Pill color={mat.color} bg={mat.bg}>{mat.label}</Pill>} />
            <InfoField label="Quantidade" value={`${reg.quantidade} ${reg.unidadeMedida}`} />
            <InfoField label="Peso" value={reg.peso != null ? `${reg.peso} ${reg.unidadeMedida}` : '—'} />
            <InfoField label="Destinação" value={reg.destinacao ?? '—'} />
            <InfoField label="Empresa Coletora" value={reg.coletor?.razaoSocial ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: reg.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {reg.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="COLETA_SELETIVA" entidadeId={reg.id} tipos={TIPOS_DOCUMENTO_COLETA} titulo="Documentos" />
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
