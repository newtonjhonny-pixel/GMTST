'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Vencer' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivado' },
}

const TIPOS_DOCUMENTO_PCMSO = [
  'PCMSO assinado',
  'Cronograma anual',
  'Relatório médico',
  'Evidência',
  'Outros',
]

type PcmsoDetail = {
  id: string
  status: string
  medicoResponsavel: string
  crm: string | null
  clinica: string | null
  vigenciaInicial: string
  vigenciaFinal: string | null
  observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
  examesPrevistos: { id: string; tipo: string; periodicidade: string; funcoes: string[] }[]
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

export function PcmsoDetailTabs({ pcmso }: { pcmso: PcmsoDetail }) {
  const [tab, setTab] = useState('dados')
  const ss = STATUS_STYLE[pcmso.status] ?? STATUS_STYLE.VIGENTE

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sst/pcmso" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              PCMSO — {pcmso.empresa.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>
              {ss.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pcmso.unidade.nome} — {pcmso.unidade.cidade}/{pcmso.unidade.uf}
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
            <InfoField label="Empresa" value={pcmso.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${pcmso.unidade.nome} — ${pcmso.unidade.cidade}/${pcmso.unidade.uf}`} />
            <InfoField label="Status" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Dados do Documento</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Médico Responsável" value={pcmso.medicoResponsavel} />
            <InfoField label="CRM" value={pcmso.crm ?? '—'} />
            <InfoField label="Clínica / Empresa Parceira" value={pcmso.clinica ?? '—'} />
            <InfoField label="Vigência Inicial" value={fmt(pcmso.vigenciaInicial)} />
            <InfoField label="Vigência Final" value={fmt(pcmso.vigenciaFinal)} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: pcmso.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {pcmso.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="PCMSO" entidadeId={pcmso.id} tipos={TIPOS_DOCUMENTO_PCMSO} titulo="Documentos do PCMSO" />
      )}

      {tab === 'historico' && (
        pcmso.examesPrevistos.length === 0 ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <HistoryIcon size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Nenhum cronograma de exames registrado</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Cronograma de Exames Previstos</p>
            <div className="flex flex-col gap-2">
              {pcmso.examesPrevistos.map(e => (
                <div key={e.id} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{e.tipo} — {e.periodicidade}</p>
                  {e.funcoes.length > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{e.funcoes.join(', ')}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
