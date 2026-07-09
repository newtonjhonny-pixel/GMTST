'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'

type Empresa = { id: string; razaoSocial: string }
type AvcbRow = {
  id: string; numero: string; tipo: string; orgaoEmissor: string
  dataValidade: string; responsavelTecnico: string | null; status: string
  empresa: { razaoSocial: string }; unidade: { nome: string }
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Vencer' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivado' },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}
function diasPara(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

async function exportExcel(rows: AvcbRow[]) {
  const XLSX = (await import('xlsx')).default
  const sheet = rows.map(r => ({
    'Empresa': r.empresa.razaoSocial,
    'Unidade': r.unidade.nome,
    'Tipo': r.tipo,
    'Número': r.numero,
    'Órgão Emissor': r.orgaoEmissor,
    'Validade': fmt(r.dataValidade),
    'Responsável Técnico': r.responsavelTecnico ?? '—',
    'Status': STATUS_STYLE[r.status]?.label ?? r.status,
  }))
  const ws = XLSX.utils.json_to_sheet(sheet)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'AVCB_CLCB')
  XLSX.writeFile(wb, `GestaoTST_AVCB_CLCB_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function exportPDF(rows: AvcbRow[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text('Relatório de AVCB / CLCB', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · GestãoTST`, 14, 23)
  autoTable(doc, {
    head: [['Empresa', 'Unidade', 'Tipo', 'Número', 'Órgão Emissor', 'Validade', 'Responsável', 'Status']],
    body: rows.map(r => [r.empresa.razaoSocial, r.unidade.nome, r.tipo, r.numero, r.orgaoEmissor, fmt(r.dataValidade), r.responsavelTecnico ?? '—', STATUS_STYLE[r.status]?.label ?? r.status]),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })
  doc.save(`GestaoTST_AVCB_CLCB_${new Date().toISOString().slice(0, 10)}.pdf`)
}

function RegistrosAvcbContent() {
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<AvcbRow[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [empresaId, setEmpresaId] = useState('')

  useEffect(() => { fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas) }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (tipo) params.set('tipo', tipo)
    if (status) params.set('status', status)
    if (empresaId) params.set('empresaId', empresaId)
    const res = await fetch(`/api/sst/avcb?${params.toString()}`)
    const data = await res.json()
    setRows(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [q, tipo, status, empresaId])

  useEffect(() => { carregar() }, [carregar])

  const vencidos = rows.filter(r => r.status === 'VENCIDO').length
  const aVencer = rows.filter(r => { const d = diasPara(r.dataValidade); return d >= 0 && d <= 30 }).length

  return (
    <div className="print:p-0">
      <div className="flex items-end justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>AVCB / CLCB</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {rows.length} registro{rows.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer (30d)</span>}
          </p>
        </div>
        <Link href="/sst/avcb/registros/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} /> Novo AVCB/CLCB
        </Link>
      </div>

      {/* Busca e filtros avançados */}
      <div className="rounded-xl p-4 mb-4 print:hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="flex items-center gap-2 rounded-lg px-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', height: 36 }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por número, responsável, órgão..." className="flex-1 bg-transparent text-xs outline-none" style={{ color: 'var(--text-primary)' }} />
          </div>
          <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="AVCB">AVCB</option>
            <option value="CLCB">CLCB</option>
          </select>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="VIGENTE">Vigente</option>
            <option value="A_VENCER">A Vencer</option>
            <option value="VENCIDO">Vencido</option>
            <option value="ARQUIVADO">Arquivado</option>
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
          { key: 'empresa', label: 'Empresa' },
          { key: 'unidade', label: 'Unidade' },
          { key: 'tipo', label: 'Tipo', width: '70px' },
          { key: 'numero', label: 'Número', width: '110px' },
          { key: 'orgao', label: 'Órgão Emissor' },
          { key: 'validade', label: 'Validade', width: '110px' },
          { key: 'resp', label: 'Responsável' },
          { key: 'status', label: 'Status', width: '100px' },
          { key: 'acoes', label: '', width: '50px' },
        ]}
        rowCount={loading ? 1 : rows.length}
        empty={{ icon: '🧯', message: loading ? 'Carregando...' : 'Nenhum registro encontrado' }}
      >
        {!loading && rows.map(r => {
          const ss = STATUS_STYLE[r.status] ?? STATUS_STYLE.VIGENTE
          const dias = diasPara(r.dataValidade)
          return (
            <Tr key={r.id}>
              <Td bold>{r.empresa.razaoSocial}</Td>
              <Td muted>{r.unidade.nome}</Td>
              <Td><Pill color="#dc2626" bg="#fef2f2">{r.tipo}</Pill></Td>
              <Td mono>{r.numero}</Td>
              <Td muted>{r.orgaoEmissor}</Td>
              <Td>
                {dias < 0
                  ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                  : dias <= 30
                    ? <Pill color="#d97706" bg="#fffbeb">{fmt(r.dataValidade)} ({dias}d)</Pill>
                    : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmt(r.dataValidade)}</span>}
              </Td>
              <Td muted>{r.responsavelTecnico ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <Link href={`/sst/avcb/registros/${r.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}

export default function RegistrosAvcbPage() {
  return (
    <Suspense fallback={null}>
      <RegistrosAvcbContent />
    </Suspense>
  )
}
