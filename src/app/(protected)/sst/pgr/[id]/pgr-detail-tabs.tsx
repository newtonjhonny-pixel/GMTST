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

const TIPOS_DOCUMENTO_PGR = [
  'PGR assinado',
  'Inventário de riscos',
  'Plano de ação',
  'ART',
  'Evidência',
  'Outros',
]

type PgrDetail = {
  id: string
  versao: string
  status: string
  dataEmissao: string
  dataRevisao: string | null
  responsavelTecnico: string
  crea: string | null
  observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
  revisoes: { id: string; versao: string; dataRevisao: string; descricao: string | null }[]
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

export function PgrDetailTabs({ pgr }: { pgr: PgrDetail }) {
  const [tab, setTab] = useState('dados')
  const ss = STATUS_STYLE[pgr.status] ?? STATUS_STYLE.VIGENTE

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sst/pgr" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              PGR — {pgr.empresa.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>
              {ss.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pgr.unidade.nome} — {pgr.unidade.cidade}/{pgr.unidade.uf} &middot; Versão {pgr.versao}
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
            <InfoField label="Empresa" value={pgr.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${pgr.unidade.nome} — ${pgr.unidade.cidade}/${pgr.unidade.uf}`} />
            <InfoField label="Versão" value={pgr.versao} />
            <InfoField label="Status" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Dados do Documento</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Data de Emissão" value={fmt(pgr.dataEmissao)} />
            <InfoField label="Próxima Revisão" value={fmt(pgr.dataRevisao)} />
            <InfoField label="Responsável Técnico" value={pgr.responsavelTecnico} />
            <InfoField label="CREA" value={pgr.crea ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: pgr.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {pgr.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="PGR" entidadeId={pgr.id} tipos={TIPOS_DOCUMENTO_PGR} titulo="Documentos do PGR" />
      )}

      {tab === 'historico' && (
        pgr.revisoes.length === 0 ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <HistoryIcon size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Nenhuma revisão registrada</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pgr.revisoes.map(r => (
              <div key={r.id} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Versão {r.versao} — {fmt(r.dataRevisao)}</p>
                {r.descricao && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.descricao}</p>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
