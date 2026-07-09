'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'
import { CATEGORIAS_DOCUMENTO_PADRAO } from '@/lib/anexos-categorias'

const TIPO: Record<string, string> = {
  LP: 'LP', LI: 'LI', LO: 'LO', LAS: 'LAS',
  OUTORGA: 'Outorga', CTF_IBAMA: 'CTF/IBAMA', AUTORIZACAO: 'Autorização', OUTRO: 'Outro',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencida' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Renovar' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelada' },
}
const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:      { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:  { bg: '#eff6ff', text: '#2563eb' },
  SUBSTITUIR: { bg: '#fffbeb', text: '#d97706' },
  EXCLUIR:    { bg: '#fef2f2', text: '#dc2626' },
  VISUALIZAR: { bg: '#f1f5f9', text: '#475569' },
  BAIXAR:     { bg: '#f1f5f9', text: '#475569' },
}

type LicencaDetail = {
  id: string; tipo: string; orgao: string; numero: string | null
  emissao: string | null; vencimento: string; responsavel: string | null
  condicionantes: string | null; status: string
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
  qtdCondicionantesVinculadas: number
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function LicencaDetailTabs({ licenca, historico }: { licenca: LicencaDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const ss = STATUS_STYLE[licenca.status] ?? STATUS_STYLE.VIGENTE

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/licencas" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {TIPO[licenca.tipo] ?? licenca.tipo} — {licenca.orgao}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {licenca.empresa.razaoSocial} · {licenca.unidade.nome} — {licenca.unidade.cidade}/{licenca.unidade.uf}
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
            <InfoField label="Empresa" value={licenca.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${licenca.unidade.nome} — ${licenca.unidade.cidade}/${licenca.unidade.uf}`} />
            <InfoField label="Tipo" value={<Pill color="#185FA5" bg="#E6F1FB">{TIPO[licenca.tipo] ?? licenca.tipo}</Pill>} />
            <InfoField label="Status" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Dados do Documento</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Órgão Emissor" value={licenca.orgao} />
            <InfoField label="Número" value={licenca.numero ?? '—'} />
            <InfoField label="Data de Emissão" value={fmt(licenca.emissao)} />
            <InfoField label="Data de Vencimento" value={fmt(licenca.vencimento)} />
            <InfoField label="Responsável" value={licenca.responsavel ?? '—'} />
            <InfoField label="Condicionantes Vinculadas" value={licenca.qtdCondicionantesVinculadas} />
          </InfoGrid>

          <InfoSectionLabel>Condicionantes / Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: licenca.condicionantes ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {licenca.condicionantes || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="LICENCA_AMBIENTAL" entidadeId={licenca.id} tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
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
