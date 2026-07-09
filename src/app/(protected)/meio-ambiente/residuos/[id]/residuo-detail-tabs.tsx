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

const SITUACAO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  GERADO:            { bg: '#eff6ff', text: '#2563eb', label: 'Gerado' },
  AGUARDANDO_COLETA: { bg: '#fffbeb', text: '#d97706', label: 'Aguardando Coleta' },
  COLETADO:          { bg: '#f5f3ff', text: '#7c3aed', label: 'Coletado' },
  DESTINADO:         { bg: '#f0fdf4', text: '#16a34a', label: 'Destinado' },
}

type ResiduoDetail = {
  id: string
  descricao: string
  tipoResiduo: string | null
  classificacao: string | null
  codigoIBAMA: string | null
  classeRisco: string | null
  origem: string | null
  setorGerador: string | null
  quantidade: number
  unidadeMedida: string
  peso: number | null
  formaArmazenamento: string | null
  dataGeracao: string
  dataColeta: string | null
  dataDestinacao: string | null
  destinacao: string
  empresaColetora: string | null
  responsavel: string | null
  situacao: string
  mtr: string | null
  certificadoDest: string | null
  observacao: string | null
  empresa: { razaoSocial: string } | null
  unidade: { nome: string; cidade: string; uf: string } | null
  coletor: { razaoSocial: string } | null
}

type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ResiduoDetailTabs({ residuo, historico }: { residuo: ResiduoDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const ss = SITUACAO_STYLE[residuo.situacao] ?? SITUACAO_STYLE.GERADO

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/residuos" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {residuo.descricao}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>
              {ss.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {residuo.empresa?.razaoSocial ?? '—'}{residuo.unidade ? ` · ${residuo.unidade.nome} — ${residuo.unidade.cidade}/${residuo.unidade.uf}` : ''}
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
          <InfoSectionLabel>Localização</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Empresa" value={residuo.empresa?.razaoSocial ?? '—'} />
            <InfoField label="Unidade" value={residuo.unidade ? `${residuo.unidade.nome} — ${residuo.unidade.cidade}/${residuo.unidade.uf}` : '—'} />
          </InfoGrid>

          <InfoSectionLabel>Identificação do Resíduo</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Descrição" value={residuo.descricao} />
            <InfoField label="Tipo de Resíduo" value={residuo.tipoResiduo ?? '—'} />
            <InfoField label="Classificação" value={residuo.classificacao ?? '—'} />
            <InfoField label="Classe do Resíduo" value={residuo.classeRisco ?? '—'} />
            <InfoField label="Código do Resíduo (IBAMA)" value={residuo.codigoIBAMA ?? '—'} />
            <InfoField label="Origem" value={residuo.origem ?? '—'} />
            <InfoField label="Setor Gerador" value={residuo.setorGerador ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Quantidade e Armazenamento</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Quantidade" value={`${residuo.quantidade} ${residuo.unidadeMedida}`} />
            <InfoField label="Peso" value={residuo.peso != null ? `${residuo.peso} ${residuo.unidadeMedida}` : '—'} />
            <InfoField label="Forma de Armazenamento" value={residuo.formaArmazenamento ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Datas e Situação</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Data de Geração" value={fmt(residuo.dataGeracao)} />
            <InfoField label="Data da Coleta" value={fmt(residuo.dataColeta)} />
            <InfoField label="Data da Destinação" value={fmt(residuo.dataDestinacao)} />
            <InfoField label="Situação" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Destinação e Documentação</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Destinação Final" value={residuo.destinacao} />
            <InfoField label="Empresa Coletora" value={residuo.coletor?.razaoSocial ?? residuo.empresaColetora ?? '—'} />
            <InfoField label="Responsável" value={residuo.responsavel ?? '—'} />
            <InfoField label="Nº MTR" value={residuo.mtr ?? '—'} />
            <InfoField label="Certificado de Destinação" value={residuo.certificadoDest ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: residuo.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {residuo.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="CONTROLE_RESIDUO" entidadeId={residuo.id} tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
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
