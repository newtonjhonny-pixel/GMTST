'use client'
import { useState } from 'react'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { Pill } from '@/components/ui/data-table'
import { CATEGORIAS_DOCUMENTO_PADRAO } from '@/lib/anexos-categorias'

const TIPO_LABEL: Record<string, string> = {
  EFLUENTE_LIQUIDO:    'Efluente Líquido',
  EMISSAO_ATMOSFERICA: 'Emissão Atmosférica',
  RUIDO_AMBIENTAL:     'Ruído Ambiental',
  AGUA_SUBTERRANEA:    'Água Subterrânea',
  SOLO:                'Solo',
  OUTRO:               'Outro',
}
const TIPO_COLOR: Record<string, { bg: string; text: string }> = {
  EFLUENTE_LIQUIDO:    { bg: '#eff6ff', text: '#2563eb' },
  EMISSAO_ATMOSFERICA: { bg: '#fef3c7', text: '#92400e' },
  RUIDO_AMBIENTAL:     { bg: '#fdf4ff', text: '#7c3aed' },
  AGUA_SUBTERRANEA:    { bg: '#ecfeff', text: '#0e7490' },
  SOLO:                { bg: '#f0fdf4', text: '#16a34a' },
  OUTRO:               { bg: '#f1f5f9', text: '#475569' },
}
const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:      { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:  { bg: '#eff6ff', text: '#2563eb' },
  SUBSTITUIR: { bg: '#fffbeb', text: '#d97706' },
  EXCLUIR:    { bg: '#fef2f2', text: '#dc2626' },
  VISUALIZAR: { bg: '#f1f5f9', text: '#475569' },
  BAIXAR:     { bg: '#f1f5f9', text: '#475569' },
}

type MonitoramentoDetail = {
  id: string; tipo: string; parametro: string; resultado: string | null
  unidadeMedida: string | null; limitePermitido: string | null; conformidade: boolean | null
  dataColeta: string; dataProxima: string | null; laboratorio: string | null
  responsavel: string | null; observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function MonitoramentoDetailTabs({ item, historico }: { item: MonitoramentoDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const tc = TIPO_COLOR[item.tipo] ?? TIPO_COLOR.OUTRO

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/monitoramentos" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {item.parametro} — {item.empresa.razaoSocial}
            </h1>
            {item.conformidade !== null && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: item.conformidade ? '#f0fdf4' : '#fef2f2', color: item.conformidade ? '#16a34a' : '#dc2626' }}>
                {item.conformidade ? 'Conforme' : 'Não Conforme'}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {item.unidade.nome} — {item.unidade.cidade}/{item.unidade.uf}
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
            <InfoField label="Empresa" value={item.empresa.razaoSocial} />
            <InfoField label="Unidade" value={`${item.unidade.nome} — ${item.unidade.cidade}/${item.unidade.uf}`} />
            <InfoField label="Tipo" value={<Pill color={tc.text} bg={tc.bg}>{TIPO_LABEL[item.tipo] ?? item.tipo}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Medição</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Parâmetro" value={item.parametro} />
            <InfoField label="Resultado" value={item.resultado ? `${item.resultado} ${item.unidadeMedida ?? ''}`.trim() : '—'} />
            <InfoField label="Limite Permitido" value={item.limitePermitido ?? '—'} />
            <InfoField
              label="Conformidade"
              value={item.conformidade === null
                ? '—'
                : <Pill color={item.conformidade ? '#16a34a' : '#dc2626'} bg={item.conformidade ? '#f0fdf4' : '#fef2f2'}>{item.conformidade ? 'Conforme' : 'Não Conforme'}</Pill>}
            />
          </InfoGrid>

          <InfoSectionLabel>Coleta</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Data da Coleta" value={fmt(item.dataColeta)} />
            <InfoField label="Próxima Coleta" value={fmt(item.dataProxima)} />
            <InfoField label="Laboratório" value={item.laboratorio ?? '—'} />
            <InfoField label="Responsável" value={item.responsavel ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: item.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {item.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="MONITORAMENTO_AMBIENTAL" entidadeId={item.id} tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
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
