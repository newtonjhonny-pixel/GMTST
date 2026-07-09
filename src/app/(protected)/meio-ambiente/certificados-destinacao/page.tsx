'use client'
import { useEffect, useState, useCallback } from 'react'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, Search, Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Empresa = { id: string; razaoSocial: string }
type Certificado = {
  id: string; numero: string | null; dataEmissao: string; dataVencimento: string | null
  tiposResiduos: string[]; quantidadeTotal: number | null; unidadeMedida: string | null
  empresa: { razaoSocial: string }; coletor: { razaoSocial: string }
}

function diasPara(d: string | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

async function exportExcel(rows: Certificado[]) {
  const XLSX = (await import('xlsx')).default
  const sheet = rows.map(c => ({
    'Nº Certificado': c.numero ?? '—',
    'Empresa Geradora': c.empresa.razaoSocial,
    'Coletora / Destinadora': c.coletor.razaoSocial,
    'Emissão': fmt(c.dataEmissao),
    'Resíduos': c.tiposResiduos.join(', '),
    'Quantidade': c.quantidadeTotal != null ? `${c.quantidadeTotal} ${c.unidadeMedida ?? ''}` : '—',
    'Validade': fmt(c.dataVencimento),
  }))
  const ws = XLSX.utils.json_to_sheet(sheet)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Certificados_Destinacao')
  XLSX.writeFile(wb, `GestaoTST_Certificados_Destinacao_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function exportPDF(rows: Certificado[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text('Relatório de Certificados de Destinação Final', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · GestãoTST`, 14, 23)
  autoTable(doc, {
    head: [['Nº Certificado', 'Empresa Geradora', 'Coletora', 'Emissão', 'Resíduos', 'Quantidade', 'Validade']],
    body: rows.map(c => [c.numero ?? '—', c.empresa.razaoSocial, c.coletor.razaoSocial, fmt(c.dataEmissao), c.tiposResiduos.join(', '), c.quantidadeTotal != null ? `${c.quantidadeTotal} ${c.unidadeMedida ?? ''}` : '—', fmt(c.dataVencimento)]),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [8, 145, 178], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })
  doc.save(`GestaoTST_Certificados_Destinacao_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export default function CertificadosDestinacaoPage() {
  const [rows, setRows] = useState<Certificado[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)
  const [q, setQ] = useState('')
  const [empresaId, setEmpresaId] = useState('')

  useEffect(() => { fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas) }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (empresaId) params.set('empresaId', empresaId)
    const res = await fetch(`/api/meio-ambiente/certificados-destinacao?${params.toString()}`)
    const data = await res.json()
    setRows(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [q, empresaId])

  useEffect(() => { carregar() }, [carregar])

  const vencidos = rows.filter(c => (diasPara(c.dataVencimento) ?? 1) < 0).length

  return (
    <div className="print:p-0">
      <div className="flex items-end justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Certificados de Destinação Final
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {rows.length} certificado{rows.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/certificados-destinacao/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Certificado
        </Link>
      </div>

      <div className="rounded-xl p-4 mb-4 print:hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="flex items-center gap-2 rounded-lg px-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', height: 36 }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por número, responsável..." className="flex-1 bg-transparent text-xs outline-none" style={{ color: 'var(--text-primary)' }} />
          </div>
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
          { key: 'numero',    label: 'Nº Certificado',  width: '130px' },
          { key: 'empresa',   label: 'Empresa Geradora' },
          { key: 'coletor',   label: 'Coletora / Destinadora' },
          { key: 'emissao',   label: 'Emissão',          width: '110px' },
          { key: 'residuos',  label: 'Resíduos' },
          { key: 'qtd',       label: 'Quantidade',       width: '110px', align: 'center' as const },
          { key: 'validade',  label: 'Validade' },
          { key: 'acoes',     label: '',                 width: '50px' },
        ]}
        rowCount={loading ? 1 : rows.length}
        empty={{ icon: '📄', message: loading ? 'Carregando...' : 'Nenhum certificado de destinação cadastrado' }}
      >
        {!loading && rows.map(c => {
          const dias = diasPara(c.dataVencimento)
          return (
            <Tr key={c.id}>
              <Td mono bold>{c.numero ?? '—'}</Td>
              <Td>{c.empresa.razaoSocial}</Td>
              <Td muted>{c.coletor.razaoSocial}</Td>
              <Td muted>{fmt(c.dataEmissao)}</Td>
              <Td muted>
                <span style={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.tiposResiduos.join(', ') || '—'}
                </span>
              </Td>
              <Td align="center">
                {c.quantidadeTotal != null
                  ? <span style={{ fontWeight: 700 }}>{c.quantidadeTotal} {c.unidadeMedida ?? ''}</span>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>
                }
              </Td>
              <Td>
                {dias === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(c.dataVencimento)} ({dias}d)</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">{fmt(c.dataVencimento)}</Pill>
                }
              </Td>
              <Td>
                <Link href={`/meio-ambiente/certificados-destinacao/${c.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
