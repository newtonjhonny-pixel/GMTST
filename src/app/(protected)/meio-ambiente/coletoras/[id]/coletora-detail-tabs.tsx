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

const TIPOS_DOCUMENTO_COLETORA = ['Licença Ambiental', 'Contrato', 'Certificados', 'Outros']

type ColetoraDetail = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  telefone: string | null
  email: string | null
  responsavel: string | null
  licencaAmbiental: string | null
  numeroLicenca: string | null
  validadeLicenca: string | null
  endereco: string | null
  municipio: string | null
  estado: string | null
  tiposResiduos: string[]
  status: string
  observacao: string | null
}

type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ColetoraDetailTabs({ coletora, historico }: { coletora: ColetoraDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const ativo = coletora.status === 'ATIVO'

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/coletoras" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {coletora.razaoSocial}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ativo ? '#f0fdf4' : '#f8fafc', color: ativo ? '#16a34a' : '#64748b' }}>
              {ativo ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          {coletora.nomeFantasia && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{coletora.nomeFantasia}</p>
          )}
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
          <InfoSectionLabel>Dados da Empresa</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Razão Social" value={coletora.razaoSocial} />
            <InfoField label="Nome Fantasia" value={coletora.nomeFantasia ?? '—'} />
            <InfoField label="CNPJ" value={coletora.cnpj ?? '—'} />
            <InfoField label="Telefone" value={coletora.telefone ?? '—'} />
            <InfoField label="E-mail" value={coletora.email ?? '—'} />
            <InfoField label="Responsável / Contato" value={coletora.responsavel ?? '—'} />
            <InfoField label="Status" value={<Pill color={ativo ? '#16a34a' : '#64748b'} bg={ativo ? '#f0fdf4' : '#f8fafc'}>{ativo ? 'Ativa' : 'Inativa'}</Pill>} />
          </InfoGrid>

          <InfoSectionLabel>Endereço</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Endereço" value={coletora.endereco ?? '—'} />
            <InfoField label="Município" value={coletora.municipio ?? '—'} />
            <InfoField label="Estado" value={coletora.estado ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Licença Ambiental</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Tipo de Licença" value={coletora.licencaAmbiental ?? '—'} />
            <InfoField label="Nº da Licença" value={coletora.numeroLicenca ?? '—'} />
            <InfoField label="Validade" value={fmt(coletora.validadeLicenca)} />
          </InfoGrid>

          <InfoSectionLabel>Tipos de Resíduos Aceitos</InfoSectionLabel>
          {coletora.tiposResiduos.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {coletora.tiposResiduos.map(t => (
                <Pill key={t} color="#0369a1" bg="#e0f2fe">{t}</Pill>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum tipo cadastrado.</p>
          )}

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: coletora.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {coletora.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="EMPRESA_COLETORA" entidadeId={coletora.id} tipos={TIPOS_DOCUMENTO_COLETORA} titulo="Documentos" />
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
