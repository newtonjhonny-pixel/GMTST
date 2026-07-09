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

const TIPOS_DOCUMENTO_CERTIFICADO = ['Certificado', 'Manifesto', 'Nota Fiscal', 'Comprovantes', 'Outros']

type CertificadoDetail = {
  id: string
  numero: string | null
  dataEmissao: string
  dataVencimento: string | null
  tiposResiduos: string[]
  quantidadeTotal: number | null
  peso: number | null
  unidadeMedida: string | null
  formaDestinacao: string | null
  responsavel: string | null
  observacao: string | null
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string } | null
  coletor: { razaoSocial: string }
}

type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function diasPara(d: string | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export function CertificadoDetailTabs({ cert, historico }: { cert: CertificadoDetail; historico: HistoricoItem[] }) {
  const [tab, setTab] = useState('dados')
  const dias = diasPara(cert.dataVencimento)
  const vencido = dias !== null && dias < 0

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/meio-ambiente/certificados-destinacao" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              Certificado {cert.numero ?? '—'} — {cert.empresa.razaoSocial}
            </h1>
            {cert.dataVencimento && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: vencido ? '#fef2f2' : '#f0fdf4', color: vencido ? '#dc2626' : '#16a34a' }}>
                {vencido ? 'Vencido' : 'Vigente'}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Destinado por {cert.coletor.razaoSocial}
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
            <InfoField label="Empresa Geradora" value={cert.empresa.razaoSocial} />
            <InfoField label="Unidade" value={cert.unidade ? `${cert.unidade.nome} — ${cert.unidade.cidade}/${cert.unidade.uf}` : '—'} />
            <InfoField label="Empresa Coletora / Destinadora" value={cert.coletor.razaoSocial} />
            <InfoField label="Nº do Certificado" value={cert.numero ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Dados da Destinação</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Data da Destinação" value={fmt(cert.dataEmissao)} />
            <InfoField label="Validade" value={fmt(cert.dataVencimento)} />
            <InfoField label="Destino Final" value={cert.formaDestinacao ?? '—'} />
            <InfoField label="Responsável" value={cert.responsavel ?? '—'} />
            <InfoField label="Quantidade" value={cert.quantidadeTotal != null ? `${cert.quantidadeTotal} ${cert.unidadeMedida ?? ''}` : '—'} />
            <InfoField label="Peso" value={cert.peso != null ? `${cert.peso} ${cert.unidadeMedida ?? ''}` : '—'} />
          </InfoGrid>

          <InfoSectionLabel>Tipos de Resíduos</InfoSectionLabel>
          {cert.tiposResiduos.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cert.tiposResiduos.map(t => (
                <Pill key={t} color="#0369a1" bg="#e0f2fe">{t}</Pill>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum tipo cadastrado.</p>
          )}

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: cert.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {cert.observacao || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="CERTIFICADO_DESTINACAO" entidadeId={cert.id} tipos={TIPOS_DOCUMENTO_CERTIFICADO} titulo="Documentos" />
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
