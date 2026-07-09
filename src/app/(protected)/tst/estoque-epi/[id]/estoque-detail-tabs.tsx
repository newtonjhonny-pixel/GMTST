'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList, ArrowRightLeft, Ban, Save, Package } from 'lucide-react'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'

const TIPOS_DOCUMENTO_EPI = ['Certificado do CA', 'Manual', 'Nota Fiscal', 'FISPQ', 'Outros']

const TIPO_MOV_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ENTRADA:   { bg: '#f0fdf4', text: '#16a34a', label: 'Entrada' },
  SAIDA:     { bg: '#fef2f2', text: '#dc2626', label: 'Saída' },
  DEVOLUCAO: { bg: '#eff6ff', text: '#2563eb', label: 'Devolução' },
  AJUSTE:    { bg: '#fffbeb', text: '#d97706', label: 'Ajuste' },
  PERDA:     { bg: '#fef2f2', text: '#b91c1c', label: 'Perda' },
  BAIXA:     { bg: '#f1f5f9', text: '#475569', label: 'Baixa' },
}
const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:      { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:  { bg: '#eff6ff', text: '#2563eb' },
  EXCLUIR:    { bg: '#fef2f2', text: '#dc2626' },
}

type EpiDetail = {
  id: string; empresaId: string | null; empresa: { razaoSocial: string } | null
  nome: string; ca: string; tipo: string; validade: string | null; status: string
  codigoInterno: string | null; codigoBarras: string | null; descricao: string | null
  categoria: string | null; fabricante: string | null; modelo: string | null
  tamanho: string | null; cor: string | null; unidadeMedida: string | null
  quantidadeEstoque: number; estoqueMinimo: number; localizacao: string | null
  fornecedor: string | null; valorUnitario: number | null; lote: string | null
  dataCompra: string | null; dataEntrada: string | null; observacoes: string | null
}
type Movimento = {
  id: string; tipo: string; quantidade: number; dataMovimento: string
  fornecedor: string | null; notaFiscal: string | null; responsavel: string | null
  motivo: string | null; observacao: string | null; ativo: boolean
  ficha: { id: string; colaboradorNome: string } | null; usuario: string | null
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }

function fmt(d: string | null) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtMoeda(v: number | null) {
  return v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'
}

export function EstoqueEpiDetailTabs({ epi, movimentos, historico }: { epi: EpiDetail; movimentos: Movimento[]; historico: HistoricoItem[] }) {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const isAdmin = (sessionData?.user as any)?.role === 'ADMINISTRADOR'

  const [tab, setTab] = useState('dados')
  const [erro, setErro] = useState('')
  const [alterando, setAlterando] = useState(false)
  const [referenceTime] = useState(() => new Date().getTime())

  const ativo = epi.status === 'ATIVO'
  const baixo = epi.quantidadeEstoque < epi.estoqueMinimo
  const diasCA = epi.validade ? Math.ceil((new Date(epi.validade).getTime() - referenceTime) / 86400000) : null
  const caVencido = diasCA !== null && diasCA < 0

  async function alternarStatus() {
    setAlterando(true)
    setErro('')
    try {
      const novoStatus = ativo ? 'ARQUIVADO' : 'ATIVO'
      const res = await fetch(`/api/epis/${epi.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao atualizar'); setAlterando(false); return }
      router.refresh()
    } finally {
      setAlterando(false)
    }
  }

  async function alternarMovimento(movId: string, novoAtivo: boolean) {
    setErro('')
    const res = await fetch(`/api/tst/estoque-epi/${movId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: novoAtivo }),
    })
    const data = await res.json()
    if (!res.ok) { setErro(data.error ?? 'Erro ao atualizar movimento'); return }
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 980 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tst/estoque-epi" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {epi.nome}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ativo ? '#f0fdf4' : '#f8fafc', color: ativo ? '#16a34a' : '#64748b' }}>
              {ativo ? 'Ativo' : 'Excluído logicamente'}
            </span>
            {baixo && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#fffbeb', color: '#d97706' }}>Estoque Baixo</span>}
            {caVencido && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#fef2f2', color: '#dc2626' }}>CA Vencido</span>}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            CA {epi.ca} · {epi.empresa?.razaoSocial ?? 'Sem empresa vinculada'} · Estoque: <strong style={{ color: baixo ? '#d97706' : 'var(--text-primary)' }}>{epi.quantidadeEstoque}</strong> {epi.unidadeMedida}
          </p>
        </div>
        <Link
          href={`/tst/estoque-epi/movimento?epiId=${epi.id}${epi.empresaId ? `&empresaId=${epi.empresaId}` : ''}`}
          className="flex items-center gap-2"
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
        >
          <ArrowRightLeft size={14} />Registrar Movimento
        </Link>
        {isAdmin && (
          <button
            type="button" onClick={alternarStatus} disabled={alterando}
            className="flex items-center gap-2"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: alterando ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', background: ativo ? '#fef2f2' : '#f0fdf4', color: ativo ? '#dc2626' : '#16a34a' }}
          >
            <Ban size={14} />{ativo ? 'Excluir' : 'Restaurar'}
          </button>
        )}
      </div>

      {erro && <p className="text-sm font-medium mb-3" style={{ color: 'var(--danger)' }}>{erro}</p>}

      <DetailTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'dados', label: 'Dados Gerais', icon: ClipboardList },
          { key: 'movimentacoes', label: 'Movimentações', icon: Package },
          { key: 'documentos', label: 'Documentos', icon: FileText },
          { key: 'historico', label: 'Histórico', icon: HistoryIcon },
        ]}
      />

      {tab === 'dados' && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <InfoSectionLabel>Identificação</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Empresa" value={epi.empresa?.razaoSocial ?? '—'} />
            <InfoField label="Código Interno" value={epi.codigoInterno ?? '—'} />
            <InfoField label="Código de Barras" value={epi.codigoBarras ?? '—'} />
            <InfoField label="Categoria" value={epi.categoria ?? '—'} />
            <InfoField label="Descrição" value={epi.descricao ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Certificado de Aprovação (CA)</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Número do CA" value={epi.ca} />
            <InfoField label="Validade do CA" value={caVencido ? <Pill color="#dc2626" bg="#fef2f2">{fmt(epi.validade)} — Vencido</Pill> : fmt(epi.validade)} />
            <InfoField label="Tipo" value={epi.tipo} />
          </InfoGrid>

          <InfoSectionLabel>Características</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Fabricante" value={epi.fabricante ?? '—'} />
            <InfoField label="Modelo" value={epi.modelo ?? '—'} />
            <InfoField label="Tamanho" value={epi.tamanho ?? '—'} />
            <InfoField label="Cor" value={epi.cor ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Estoque</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Quantidade em Estoque" value={<span style={{ fontWeight: 700, color: baixo ? '#d97706' : 'var(--text-primary)' }}>{epi.quantidadeEstoque} {epi.unidadeMedida}</span>} />
            <InfoField label="Estoque Mínimo" value={`${epi.estoqueMinimo} ${epi.unidadeMedida ?? ''}`} />
            <InfoField label="Localização Física" value={epi.localizacao ?? '—'} />
          </InfoGrid>

          <InfoSectionLabel>Compra e Fornecimento</InfoSectionLabel>
          <InfoGrid>
            <InfoField label="Fornecedor" value={epi.fornecedor ?? '—'} />
            <InfoField label="Valor Unitário" value={fmtMoeda(epi.valorUnitario)} />
            <InfoField label="Lote" value={epi.lote ?? '—'} />
            <InfoField label="Data da Compra" value={fmt(epi.dataCompra)} />
            <InfoField label="Data de Entrada" value={fmt(epi.dataEntrada)} />
          </InfoGrid>

          <InfoSectionLabel>Observações</InfoSectionLabel>
          <p className="text-sm" style={{ color: epi.observacoes ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {epi.observacoes || 'Nenhuma observação registrada.'}
          </p>
        </div>
      )}

      {tab === 'movimentacoes' && (
        <DataTable
          columns={[
            { key: 'tipo', label: 'Tipo', width: '100px' },
            { key: 'qtd', label: 'Qtd.', width: '70px', align: 'center' as const },
            { key: 'data', label: 'Data', width: '100px' },
            { key: 'motivo', label: 'Motivo / Ficha' },
            { key: 'usuario', label: 'Usuário', width: '140px' },
            { key: 'status', label: 'Status', width: '90px', align: 'center' as const },
            { key: 'acoes', label: '', width: '90px' },
          ]}
          rowCount={movimentos.length}
          empty={{ icon: '📦', message: 'Nenhuma movimentação registrada' }}
        >
          {movimentos.map(m => {
            const ts = TIPO_MOV_STYLE[m.tipo] ?? { bg: '#f1f5f9', text: '#475569', label: m.tipo }
            return (
              <Tr key={m.id}>
                <Td><Pill color={ts.text} bg={ts.bg}>{ts.label}</Pill></Td>
                <Td align="center" bold={m.ativo} muted={!m.ativo}>{m.quantidade}</Td>
                <Td muted>{fmt(m.dataMovimento)}</Td>
                <Td muted={!m.ativo}>
                  {m.ficha ? `Ficha de ${m.ficha.colaboradorNome}` : (m.motivo ?? m.observacao ?? '—')}
                </Td>
                <Td muted>{m.usuario ?? '—'}</Td>
                <Td align="center">
                  <Pill color={m.ativo ? '#16a34a' : '#64748b'} bg={m.ativo ? '#f0fdf4' : '#f8fafc'}>{m.ativo ? 'Ativo' : 'Inativo'}</Pill>
                </Td>
                <Td>
                  {isAdmin && (
                    <button
                      type="button" onClick={() => alternarMovimento(m.id, !m.ativo)}
                      className="flex items-center gap-1 text-[11px] font-semibold"
                      style={{ color: m.ativo ? '#dc2626' : '#16a34a' }}
                    >
                      <Ban size={11} />{m.ativo ? 'Excluir' : 'Restaurar'}
                    </button>
                  )}
                </Td>
              </Tr>
            )
          })}
        </DataTable>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="EPI" entidadeId={epi.id} tipos={TIPOS_DOCUMENTO_EPI} titulo="Certificado, Manual, Nota Fiscal, FISPQ" />
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
