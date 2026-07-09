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

const TIPOS_DOCUMENTO_LTCAT = [
  'LTCAT assinado',
  'ART',
  'Laudo complementar',
  'Evidência técnica',
  'Outros',
]

type LtcatDetail = {
  id: string
  status: string
  responsavelTecnico: string
  crea: string | null
  art: string | null
  dataEmissao: string
  vigencia: string | null
  ambientesAvaliados: string | null
  agentesNocivos: string[]
  observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

export function LtcatDetailTabs({ ltcat }: { ltcat: LtcatDetail }) {
  const [tab, setTab] = useState('dados')
  const ss = STATUS_STYLE[ltcat.status] ?? STATUS_STYLE.VIGENTE

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sst/ltcat" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              LTCAT — {ltcat.empresa.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>
              {ss.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {ltcat.unidade.nome} — {ltcat.unidade.cidade}/{ltcat.unidade.uf}
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
            <InfoField label="Empresa" value={ltcat.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${ltcat.unidade.nome} — ${ltcat.unidade.cidade}/${ltcat.unidade.uf}`} />
            <InfoField label="Status" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Dados do Documento</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Responsável Técnico" value={ltcat.responsavelTecnico} />
            <InfoField label="CREA" value={ltcat.crea ?? '—'} />
            <InfoField label="ART" value={ltcat.art ?? '—'} />
            <InfoField label="Data de Emissão" value={fmt(ltcat.dataEmissao)} />
            <InfoField label="Data de Revisão" value={fmt(ltcat.vigencia)} />
          </InfoGrid>

          {ltcat.ambientesAvaliados && (
            <>
              <InfoSectionLabel>Ambientes Avaliados</InfoSectionLabel>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ltcat.ambientesAvaliados}</p>
            </>
          )}

          {ltcat.agentesNocivos.length > 0 && (
            <>
              <InfoSectionLabel>Agentes Nocivos</InfoSectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {ltcat.agentesNocivos.map(a => (
                  <Pill key={a} color="#7c3aed" bg="#f5f3ff">{a}</Pill>
                ))}
              </div>
            </>
          )}

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: ltcat.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {ltcat.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="LTCAT" entidadeId={ltcat.id} tipos={TIPOS_DOCUMENTO_LTCAT} titulo="Documentos do LTCAT" />
      )}

      {tab === 'historico' && (
        <div className="rounded-xl flex flex-col items-center justify-center py-16" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <HistoryIcon size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Nenhum histórico adicional disponível</p>
        </div>
      )}
    </div>
  )
}
