'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, FileText, History as HistoryIcon, ClipboardList, Shirt, Plus, Ban, Power, FileDown, Save, RotateCcw } from 'lucide-react'
import { DetailTabs } from '@/components/ui/detail-tabs'
import { DocumentManager } from '@/components/anexos/DocumentManager'
import { InfoGrid, InfoField, InfoSectionLabel } from '@/components/ui/info-grid'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVA:   { bg: '#f0fdf4', text: '#16a34a', label: 'Ativa' },
  INATIVA: { bg: '#f1f5f9', text: '#64748b', label: 'Inativa' },
}
const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:     { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR: { bg: '#eff6ff', text: '#2563eb' },
}
const TIPOS_DOCUMENTO_FICHA = ['Ficha Assinada', 'Outros']

type ItemEPI = {
  id: string; epiId: string; epiNome: string; epiCa: string; epiValidade: string | null
  quantidade: number; quantidadeDevolvida: number
  dataEntrega: string; dataVencimento: string | null; observacao: string | null; ativo: boolean
}
type Ficha = {
  id: string; dataEntrega: string; observacao: string | null; status: string
  colaborador: { id: string; nome: string; cpf: string; matricula: string | null; funcao: string; setor: string }
  empresaId: string
  empresa: { razaoSocial: string }
  unidade: { nome: string; cidade: string; uf: string }
  itens: ItemEPI[]
}
type HistoricoItem = { id: string; acao: string; descricao: string | null; createdAt: string; usuario: string | null }
type EPICatalogo = { id: string; nome: string; ca: string; tipo: string; validade: string | null; quantidadeEstoque: number; localizacao: string | null }

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

export function FichaDetailTabs({ ficha: fichaInicial, historico }: { ficha: Ficha; historico: HistoricoItem[] }) {
  const router = useRouter()
  const { data: sessionData } = useSession()
  const isAdmin = (sessionData?.user as any)?.role === 'ADMINISTRADOR'

  const [tab, setTab] = useState('dados')
  const [ficha, setFicha] = useState(fichaInicial)
  const [erro, setErro] = useState('')
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [gerandoPdf, setGerandoPdf] = useState(false)

  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState({ dataEntrega: fichaInicial.dataEntrega.slice(0, 10), observacao: fichaInicial.observacao ?? '' })
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  const [epis, setEpis] = useState<EPICatalogo[]>([])
  const [addItemAberto, setAddItemAberto] = useState(false)
  const [novoItemForm, setNovoItemForm] = useState({ epiId: '', quantidade: '1', dataEntrega: new Date().toISOString().slice(0, 10), dataVencimento: '', observacao: '' })
  const [salvandoItem, setSalvandoItem] = useState(false)

  const [devolverItemId, setDevolverItemId] = useState<string | null>(null)
  const [devolucaoForm, setDevolucaoForm] = useState({ quantidade: '1', motivo: '' })
  const [salvandoDevolucao, setSalvandoDevolucao] = useState(false)

  useEffect(() => {
    fetch(`/api/epis?empresaId=${ficha.empresaId}`).then(r => r.json()).then(setEpis)
  }, [ficha.empresaId])

  const ss = STATUS_STYLE[ficha.status] ?? STATUS_STYLE.ATIVA
  const itensVencidos = ficha.itens.filter(i => i.ativo && (diasPara(i.dataVencimento) ?? 1) < 0).length

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoEdicao(true)
    setErro('')
    try {
      const res = await fetch(`/api/tst/fichas-epi/${ficha.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setSalvandoEdicao(false); return }
      setFicha(f => ({ ...f, dataEntrega: data.dataEntrega, observacao: data.observacao }))
      setEditando(false)
      router.refresh()
    } catch {
      setErro('Erro de conexão')
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function adicionarItem() {
    if (!novoItemForm.epiId || !novoItemForm.dataEntrega) {
      setErro('Selecione o EPI e a data de entrega.')
      return
    }
    const infoEpi = epis.find(e => e.id === novoItemForm.epiId)
    const qtd = parseInt(novoItemForm.quantidade) || 0
    if (infoEpi && qtd > infoEpi.quantidadeEstoque) {
      setErro('Quantidade insuficiente em estoque.')
      return
    }
    setSalvandoItem(true)
    setErro('')
    try {
      const res = await fetch(`/api/tst/fichas-epi/${ficha.id}/itens`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoItemForm),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao adicionar item'); setSalvandoItem(false); return }
      setFicha(f => ({
        ...f,
        itens: [...f.itens, {
          id: data.id, epiId: data.epiId, epiNome: data.epi.nome, epiCa: data.epi.ca,
          epiValidade: data.epi.validade, quantidade: data.quantidade, quantidadeDevolvida: 0, dataEntrega: data.dataEntrega,
          dataVencimento: data.dataVencimento, observacao: data.observacao, ativo: true,
        }],
      }))
      setNovoItemForm({ epiId: '', quantidade: '1', dataEntrega: new Date().toISOString().slice(0, 10), dataVencimento: '', observacao: '' })
      setAddItemAberto(false)
      router.refresh()
    } catch {
      setErro('Erro de conexão')
    } finally {
      setSalvandoItem(false)
    }
  }

  async function devolverItem() {
    if (!devolverItemId) return
    const qtd = parseInt(devolucaoForm.quantidade) || 0
    if (qtd <= 0) { setErro('Informe uma quantidade válida para devolução.'); return }
    setSalvandoDevolucao(true)
    setErro('')
    try {
      const res = await fetch(`/api/tst/fichas-epi/${ficha.id}/itens/${devolverItemId}/devolucao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devolucaoForm),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao registrar devolução'); setSalvandoDevolucao(false); return }
      setFicha(f => ({ ...f, itens: f.itens.map(i => i.id === devolverItemId ? { ...i, quantidadeDevolvida: data.quantidadeDevolvida } : i) }))
      setDevolverItemId(null)
      setDevolucaoForm({ quantidade: '1', motivo: '' })
      router.refresh()
    } catch {
      setErro('Erro de conexão')
    } finally {
      setSalvandoDevolucao(false)
    }
  }

  async function alternarItemAtivo(itemId: string, ativo: boolean) {
    setErro('')
    try {
      const res = await fetch(`/api/tst/fichas-epi/${ficha.id}/itens/${itemId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao atualizar item'); return }
      setFicha(f => ({ ...f, itens: f.itens.map(i => i.id === itemId ? { ...i, ativo: data.ativo } : i) }))
      router.refresh()
    } catch {
      setErro('Erro de conexão')
    }
  }

  async function alternarStatusFicha() {
    setAlterandoStatus(true)
    setErro('')
    try {
      const novoStatus = ficha.status === 'ATIVA' ? 'INATIVA' : 'ATIVA'
      const res = await fetch(`/api/tst/fichas-epi/${ficha.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao atualizar status'); setAlterandoStatus(false); return }
      setFicha(f => ({ ...f, status: data.status }))
      router.refresh()
    } finally {
      setAlterandoStatus(false)
    }
  }

  async function gerarFichaPDF() {
    setGerandoPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF()

      doc.setFontSize(15)
      doc.setTextColor(15, 23, 42)
      doc.text('Ficha de Entrega de EPI', 14, 16)
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · GestãoTST`, 14, 22)

      doc.setFontSize(10)
      doc.setTextColor(15, 23, 42)
      let y = 32
      doc.setFont('helvetica', 'bold')
      doc.text('Empresa:', 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(ficha.empresa.razaoSocial, 45, y)
      y += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Unidade:', 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`${ficha.unidade.nome} — ${ficha.unidade.cidade}/${ficha.unidade.uf}`, 45, y)
      y += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Colaborador:', 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`${ficha.colaborador.nome} (CPF ${ficha.colaborador.cpf})`, 45, y)
      y += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Função / Setor:', 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`${ficha.colaborador.funcao} / ${ficha.colaborador.setor}`, 45, y)
      y += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Data da Entrega:', 14, y)
      doc.setFont('helvetica', 'normal')
      doc.text(fmt(ficha.dataEntrega), 45, y)
      y += 10

      autoTable(doc, {
        head: [['EPI', 'CA', 'Validade CA', 'Qtd.', 'Data Entrega', 'Assinatura']],
        body: ficha.itens.filter(i => i.ativo).map(i => [i.epiNome, i.epiCa, fmt(i.epiValidade), String(i.quantidade), fmt(i.dataEntrega), '']),
        startY: y,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [22, 101, 52], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 5: { cellWidth: 35 } },
        margin: { left: 14, right: 14 },
      })

      const finalY = (doc as any).lastAutoTable.finalY + 20
      doc.setFontSize(9)
      doc.text('Declaro ter recebido os Equipamentos de Proteção Individual (EPIs) acima relacionados,', 14, finalY)
      doc.text('em perfeito estado, comprometendo-me a usá-los e conservá-los adequadamente.', 14, finalY + 5)

      const assinaturaY = finalY + 30
      doc.line(14, assinaturaY, 90, assinaturaY)
      doc.text('Assinatura do Colaborador', 14, assinaturaY + 5)

      doc.line(120, assinaturaY, 196, assinaturaY)
      doc.text('Responsável SST', 120, assinaturaY + 5)

      doc.save(`Ficha_Entrega_EPI_${ficha.colaborador.nome.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setGerandoPdf(false)
    }
  }

  const label = (txt: string) => (
    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>{txt}</label>
  )
  const field = (children: React.ReactNode, span?: number) => (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  )

  return (
    <div style={{ maxWidth: 980 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tst/epis" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
              {ficha.colaborador.nome}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {ficha.empresa.razaoSocial} · {ficha.unidade.nome} — {ficha.unidade.cidade}/{ficha.unidade.uf} · {fmt(ficha.dataEntrega)}
          </p>
        </div>
        <button
          type="button" onClick={gerarFichaPDF} disabled={gerandoPdf}
          className="flex items-center gap-2"
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: gerandoPdf ? 'not-allowed' : 'pointer' }}
        >
          <FileDown size={14} />{gerandoPdf ? 'Gerando...' : 'Gerar Ficha de Entrega'}
        </button>
        {isAdmin && (
          <button
            type="button" onClick={alternarStatusFicha} disabled={alterandoStatus}
            className="flex items-center gap-2"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: alterandoStatus ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', background: ficha.status === 'ATIVA' ? '#fef2f2' : '#f0fdf4', color: ficha.status === 'ATIVA' ? '#dc2626' : '#16a34a' }}
          >
            <Power size={14} />{ficha.status === 'ATIVA' ? 'Inativar' : 'Reativar'}
          </button>
        )}
      </div>

      {erro && <p className="text-sm font-medium mb-3" style={{ color: 'var(--danger)' }}>{erro}</p>}

      <DetailTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'dados', label: 'Dados Gerais', icon: ClipboardList },
          { key: 'itens', label: 'Itens de EPI', icon: Shirt },
          { key: 'documentos', label: 'Documentos / Ficha Assinada', icon: FileText },
          { key: 'historico', label: 'Histórico', icon: HistoryIcon },
        ]}
      />

      {tab === 'dados' && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between">
            <InfoSectionLabel>Dados da Ficha</InfoSectionLabel>
            {!editando && (
              <button type="button" onClick={() => setEditando(true)} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Editar</button>
            )}
          </div>

          {!editando ? (
            <>
              <InfoGrid>
                <InfoField label="Colaborador" value={ficha.colaborador.nome} />
                <InfoField label="CPF" value={ficha.colaborador.cpf} />
                <InfoField label="Matrícula" value={ficha.colaborador.matricula ?? '—'} />
                <InfoField label="Função / Setor" value={`${ficha.colaborador.funcao} / ${ficha.colaborador.setor}`} />
                <InfoField label="Empresa" value={ficha.empresa.razaoSocial} />
                <InfoField label="Unidade" value={`${ficha.unidade.nome} — ${ficha.unidade.cidade}/${ficha.unidade.uf}`} />
                <InfoField label="Data da Entrega" value={fmt(ficha.dataEntrega)} />
                <InfoField label="Status" value={<Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill>} />
              </InfoGrid>
              <InfoSectionLabel>Observações Gerais</InfoSectionLabel>
              <p className="text-sm" style={{ color: ficha.observacao ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {ficha.observacao || 'Nenhuma observação registrada.'}
              </p>
            </>
          ) : (
            <form onSubmit={salvarEdicao} className="mt-3">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px 20px' }}>
                {field(<>{label('Data da Entrega')}<input className="form-input" type="date" value={editForm.dataEntrega} onChange={e => setEditForm(f => ({ ...f, dataEntrega: e.target.value }))} /></>)}
                {field(<>{label('Observações Gerais')}<textarea className="form-input" rows={2} value={editForm.observacao} onChange={e => setEditForm(f => ({ ...f, observacao: e.target.value }))} /></>)}
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setEditando(false)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={salvandoEdicao} className="flex items-center gap-2" style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', opacity: salvandoEdicao ? .7 : 1 }}>
                  <Save size={13} />{salvandoEdicao ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'itens' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {ficha.itens.filter(i => i.ativo).length} item(ns) ativo(s)
              {itensVencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {itensVencidos} vencido(s)</span>}
            </p>
            {ficha.status === 'ATIVA' && (
              <button type="button" onClick={() => setAddItemAberto(v => !v)} className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-from)' }}>
                <Plus size={13} /> {addItemAberto ? 'Fechar' : 'Adicionar Item'}
              </button>
            )}
          </div>

          {addItemAberto && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-card-alt)', border: '1px dashed var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px 16px' }}>
                {field(<>{label('EPI (do estoque)')}<select className="form-select" value={novoItemForm.epiId} onChange={e => setNovoItemForm(f => ({ ...f, epiId: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {epis.map(ep => <option key={ep.id} value={ep.id}>{ep.nome} (CA {ep.ca})</option>)}
                </select></>)}
                {field(<>{label('Quantidade Disponível')}<input className="form-input" value={(() => { const i = epis.find(e => e.id === novoItemForm.epiId); return i ? `${i.quantidadeEstoque} em estoque` : '—' })()} disabled /></>)}
                {field(<>{label('Localização')}<input className="form-input" value={epis.find(e => e.id === novoItemForm.epiId)?.localizacao ?? '—'} disabled /></>)}
                {field(<>{label('Quantidade Entregue')}<input className="form-input" type="number" min="1" value={novoItemForm.quantidade} onChange={e => setNovoItemForm(f => ({ ...f, quantidade: e.target.value }))} /></>)}
                {field(<>{label('Data de Entrega')}<input className="form-input" type="date" value={novoItemForm.dataEntrega} onChange={e => setNovoItemForm(f => ({ ...f, dataEntrega: e.target.value }))} /></>)}
                {field(<>{label('Prevista Troca/Devolução')}<input className="form-input" type="date" value={novoItemForm.dataVencimento} onChange={e => setNovoItemForm(f => ({ ...f, dataVencimento: e.target.value }))} /></>)}
                {field(<>{label('Observação')}<input className="form-input" value={novoItemForm.observacao} onChange={e => setNovoItemForm(f => ({ ...f, observacao: e.target.value }))} /></>, 3)}
              </div>
              <div className="flex justify-end mt-3">
                <button type="button" onClick={adicionarItem} disabled={salvandoItem} style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', opacity: salvandoItem ? .7 : 1 }}>
                  {salvandoItem ? 'Adicionando...' : 'Adicionar à Ficha'}
                </button>
              </div>
            </div>
          )}

          {devolverItemId && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-card-alt)', border: '1px dashed var(--border)' }}>
              <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Registrar Devolução</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px 16px' }}>
                {field(<>{label('Quantidade Devolvida')}<input className="form-input" type="number" min="1" value={devolucaoForm.quantidade} onChange={e => setDevolucaoForm(f => ({ ...f, quantidade: e.target.value }))} /></>)}
                {field(<>{label('Motivo')}<input className="form-input" placeholder="Ex: Troca de tamanho, desligamento..." value={devolucaoForm.motivo} onChange={e => setDevolucaoForm(f => ({ ...f, motivo: e.target.value }))} /></>)}
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setDevolverItemId(null)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="button" onClick={devolverItem} disabled={salvandoDevolucao} style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', opacity: salvandoDevolucao ? .7 : 1 }}>
                  {salvandoDevolucao ? 'Registrando...' : 'Confirmar Devolução'}
                </button>
              </div>
            </div>
          )}

          <DataTable
            columns={[
              { key: 'epi', label: 'EPI' },
              { key: 'ca', label: 'CA', width: '90px' },
              { key: 'valCa', label: 'Val. CA', width: '110px' },
              { key: 'qtd', label: 'Qtd.', width: '60px', align: 'center' as const },
              { key: 'dev', label: 'Devolvido', width: '80px', align: 'center' as const },
              { key: 'entrega', label: 'Entrega', width: '100px' },
              { key: 'troca', label: 'Prevista Troca', width: '120px' },
              { key: 'status', label: 'Status', width: '90px', align: 'center' as const },
              { key: 'acoes', label: '', width: '150px' },
            ]}
            rowCount={ficha.itens.length}
            empty={{ icon: '⛑', message: 'Nenhum item nesta ficha' }}
          >
            {ficha.itens.map(item => {
              const dias = diasPara(item.dataVencimento)
              const vencido = dias !== null && dias < 0
              const podeDevolver = item.ativo && item.quantidadeDevolvida < item.quantidade
              return (
                <Tr key={item.id}>
                  <Td bold={item.ativo} muted={!item.ativo}>{item.epiNome}</Td>
                  <Td mono muted>{item.epiCa}</Td>
                  <Td muted>{fmt(item.epiValidade)}</Td>
                  <Td align="center">{item.quantidade}</Td>
                  <Td align="center">
                    {item.quantidadeDevolvida > 0
                      ? <Pill color="#2563eb" bg="#eff6ff">{item.quantidadeDevolvida}</Pill>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
                  </Td>
                  <Td muted>{fmt(item.dataEntrega)}</Td>
                  <Td>
                    {!item.dataVencimento ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                      : vencido ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                      : <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(item.dataVencimento)}</span>}
                  </Td>
                  <Td align="center">
                    <Pill color={item.ativo ? '#16a34a' : '#64748b'} bg={item.ativo ? '#f0fdf4' : '#f8fafc'}>{item.ativo ? 'Ativo' : 'Inativo'}</Pill>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      {podeDevolver && (
                        <button
                          type="button" onClick={() => { setDevolverItemId(item.id); setDevolucaoForm({ quantidade: '1', motivo: '' }) }}
                          className="flex items-center gap-1 text-[11px] font-semibold"
                          style={{ color: 'var(--brand-from)' }}
                        >
                          <RotateCcw size={11} />Devolver
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button" onClick={() => alternarItemAtivo(item.id, !item.ativo)}
                          className="flex items-center gap-1 text-[11px] font-semibold"
                          style={{ color: item.ativo ? '#dc2626' : '#16a34a' }}
                        >
                          <Ban size={11} />{item.ativo ? 'Inativar' : 'Reativar'}
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </DataTable>
        </div>
      )}

      {tab === 'documentos' && (
        <DocumentManager entidade="FICHA_ENTREGA_EPI" entidadeId={ficha.id} tipos={TIPOS_DOCUMENTO_FICHA} titulo="Ficha Assinada e Documentos" />
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
