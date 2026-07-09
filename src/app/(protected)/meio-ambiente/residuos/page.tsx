'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'

type Empresa = { id: string; razaoSocial: string }
type ResiduoRow = {
  id: string; descricao: string; codigoIBAMA: string | null; classeRisco: string | null
  quantidade: number; unidadeMedida: string; dataGeracao: string; destinacao: string
  mtr: string | null; situacao: string
  empresa: { razaoSocial: string } | null; unidade: { nome: string } | null
}

const SITUACAO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  GERADO:            { bg: '#eff6ff', text: '#2563eb', label: 'Gerado' },
  AGUARDANDO_COLETA: { bg: '#fffbeb', text: '#d97706', label: 'Aguardando Coleta' },
  COLETADO:          { bg: '#f5f3ff', text: '#7c3aed', label: 'Coletado' },
  DESTINADO:         { bg: '#f0fdf4', text: '#16a34a', label: 'Destinado' },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

async function exportExcel(rows: ResiduoRow[]) {
  const XLSX = (await import('xlsx')).default
  const sheet = rows.map(r => ({
    'Empresa': r.empresa?.razaoSocial ?? '—',
    'Unidade': r.unidade?.nome ?? '—',
    'Descrição': r.descricao,
    'Cód. IBAMA': r.codigoIBAMA ?? '—',
    'Classe': r.classeRisco ?? '—',
    'Quantidade': `${r.quantidade} ${r.unidadeMedida}`,
    'Geração': fmt(r.dataGeracao),
    'Destinação': r.destinacao,
    'MTR': r.mtr ?? '—',
    'Situação': SITUACAO_STYLE[r.situacao]?.label ?? r.situacao,
  }))
  const ws = XLSX.utils.json_to_sheet(sheet)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Residuos_MTR')
  XLSX.writeFile(wb, `GestaoTST_Residuos_MTR_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function exportPDF(rows: ResiduoRow[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text('Relatório de Resíduos / MTR', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · GestãoTST`, 14, 23)
  autoTable(doc, {
    head: [['Empresa', 'Unidade', 'Descrição', 'Classe', 'Quantidade', 'Geração', 'Destinação', 'MTR', 'Situação']],
    body: rows.map(r => [r.empresa?.razaoSocial ?? '—', r.unidade?.nome ?? '—', r.descricao, r.classeRisco ?? '—', `${r.quantidade} ${r.unidadeMedida}`, fmt(r.dataGeracao), r.destinacao, r.mtr ?? '—', SITUACAO_STYLE[r.situacao]?.label ?? r.situacao]),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })
  doc.save(`GestaoTST_Residuos_MTR_${new Date().toISOString().slice(0, 10)}.pdf`)
}

function ResiduosContent() {
  const [rows, setRows] = useState<ResiduoRow[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const [q, setQ] = useState('')
  const [situacao, setSituacao] = useState('')
  const [empresaId, setEmpresaId] = useState('')

  useEffect(() => { fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas) }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (situacao) params.set('situacao', situacao)
    if (empresaId) params.set('empresaId', empresaId)
    const res = await fetch(`/api/meio-ambiente/residuos?${params.toString()}`)
    const data = await res.json()
    setRows(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [q, situacao, empresaId])

  useEffect(() => { carregar() }, [carregar])

  const pendentes = rows.filter(r => r.situacao !== 'DESTINADO').length
  const destinados = rows.filter(r => r.situacao === 'DESTINADO').length

  return (
    <div className="print:p-0">
      <div className="flex items-end justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Resíduos / MTR</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {rows.length} registro{rows.length !== 1 ? 's' : ''}
            {pendentes > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
            {destinados > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}> · {destinados} destinado{destinados !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/residuos/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} /> Novo Registro
        </Link>
      </div>

      <div className="rounded-xl p-4 mb-4 print:hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="flex items-center gap-2 rounded-lg px-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', height: 36 }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por descrição, MTR, responsável..." className="flex-1 bg-transparent text-xs outline-none" style={{ color: 'var(--text-primary)' }} />
          </div>
          <select className="form-select" value={situacao} onChange={e => setSituacao(e.target.value)}>
            <option value="">Todas as situações</option>
            <option value="GERADO">Gerado</option>
            <option value="AGUARDANDO_COLETA">Aguardando Coleta</option>
            <option value="COLETADO">Coletado</option>
            <option value="DESTINADO">Destinado</option>
          </select>
          <select className="form-select" value={empresaId} onChange={e => setEmpresaId(e.target.value)}>
            <option value="">Todas as empresas</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-3 print:hidden">
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <Printer size={12} /> Imprimir
        </button>
        <button
          disabled={exporting !== null}
          onClick={async () => { setExporting('pdf'); await exportPDF(rows); setExporting(null) }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
        >
          {exporting === 'pdf' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} PDF
        </button>
        <button
          disabled={exporting !== null}
          onClick={async () => { setExporting('excel'); await exportExcel(rows); setExporting(null) }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}
        >
          {exporting === 'excel' ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />} Excel
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'desc', label: 'Resíduo' },
          { key: 'empresa', label: 'Empresa' },
          { key: 'ibama', label: 'Cód. IBAMA', width: '100px' },
          { key: 'classe', label: 'Classe', width: '90px' },
          { key: 'qtd', label: 'Quantidade', width: '110px' },
          { key: 'geracao', label: 'Geração', width: '100px' },
          { key: 'dest', label: 'Destinação' },
          { key: 'mtr', label: 'MTR', width: '100px' },
          { key: 'situacao', label: 'Situação', width: '130px' },
          { key: 'acoes', label: '', width: '50px' },
        ]}
        rowCount={loading ? 1 : rows.length}
        empty={{ icon: '♻️', message: loading ? 'Carregando...' : 'Nenhum registro de resíduo' }}
      >
        {!loading && rows.map(r => {
          const ss = SITUACAO_STYLE[r.situacao] ?? SITUACAO_STYLE.GERADO
          return (
            <Tr key={r.id}>
              <Td bold>{r.descricao}</Td>
              <Td muted>{r.empresa?.razaoSocial ?? '—'}</Td>
              <Td mono>{r.codigoIBAMA ?? '—'}</Td>
              <Td muted>{r.classeRisco ?? '—'}</Td>
              <Td>{r.quantidade} {r.unidadeMedida}</Td>
              <Td muted>{fmt(r.dataGeracao)}</Td>
              <Td muted>{r.destinacao}</Td>
              <Td mono>{r.mtr ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <Link href={`/meio-ambiente/residuos/${r.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}

export default function ResiduosPage() {
  return (
    <Suspense fallback={null}>
      <ResiduosContent />
    </Suspense>
  )
}
