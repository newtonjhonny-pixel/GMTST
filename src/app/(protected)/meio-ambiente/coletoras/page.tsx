'use client'
import { useEffect, useState, useCallback } from 'react'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, Search, Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Coletora = {
  id: string; razaoSocial: string; cnpj: string | null; tiposResiduos: string[]
  licencaAmbiental: string | null; validadeLicenca: string | null; status: string
}

function diasPara(d: string | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

async function exportExcel(rows: Coletora[]) {
  const XLSX = (await import('xlsx')).default
  const sheet = rows.map(c => ({
    'Razão Social': c.razaoSocial,
    'CNPJ': c.cnpj ?? '—',
    'Tipos de Resíduos': c.tiposResiduos.join(', '),
    'Licença Ambiental': c.licencaAmbiental ?? '—',
    'Validade Licença': fmt(c.validadeLicenca),
    'Status': c.status === 'ATIVO' ? 'Ativa' : 'Inativa',
  }))
  const ws = XLSX.utils.json_to_sheet(sheet)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Empresas_Coletoras')
  XLSX.writeFile(wb, `GestaoTST_Empresas_Coletoras_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function exportPDF(rows: Coletora[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text('Relatório de Empresas Coletoras / Destinadoras', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · GestãoTST`, 14, 23)
  autoTable(doc, {
    head: [['Razão Social', 'CNPJ', 'Tipos de Resíduos', 'Licença', 'Validade', 'Status']],
    body: rows.map(c => [c.razaoSocial, c.cnpj ?? '—', c.tiposResiduos.join(', '), c.licencaAmbiental ?? '—', fmt(c.validadeLicenca), c.status === 'ATIVO' ? 'Ativa' : 'Inativa']),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })
  doc.save(`GestaoTST_Empresas_Coletoras_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export default function ColetorasPage() {
  const [rows, setRows] = useState<Coletora[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const res = await fetch(`/api/meio-ambiente/coletoras?${params.toString()}`)
    const data = await res.json()
    setRows(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [q, status])

  useEffect(() => { carregar() }, [carregar])

  const vencidas = rows.filter(c => (diasPara(c.validadeLicenca) ?? 1) < 0).length
  const aVencer  = rows.filter(c => { const d = diasPara(c.validadeLicenca); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div className="print:p-0">
      <div className="flex items-end justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Empresas Coletoras / Destinadoras
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {rows.length} empresa{rows.length !== 1 ? 's' : ''} cadastrada{rows.length !== 1 ? 's' : ''}
            {vencidas > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidas} com licença vencida</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer em 60d</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/coletoras/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Nova Coletora
        </Link>
      </div>

      <div className="rounded-xl p-4 mb-4 print:hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="flex items-center gap-2 rounded-lg px-3" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', height: 36 }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por razão social, CNPJ..." className="flex-1 bg-transparent text-xs outline-none" style={{ color: 'var(--text-primary)' }} />
          </div>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativa</option>
            <option value="INATIVO">Inativa</option>
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
          { key: 'nome',      label: 'Razão Social' },
          { key: 'cnpj',      label: 'CNPJ',          width: '140px' },
          { key: 'residuos',  label: 'Tipos de Resíduos' },
          { key: 'licenca',   label: 'Licença Ambiental' },
          { key: 'validade',  label: 'Validade Licença', width: '130px' },
          { key: 'status',    label: 'Status',           width: '90px', align: 'center' as const },
          { key: 'acoes',     label: '',                 width: '50px' },
        ]}
        rowCount={loading ? 1 : rows.length}
        empty={{ icon: '🚛', message: loading ? 'Carregando...' : 'Nenhuma empresa coletora cadastrada' }}
      >
        {!loading && rows.map(c => {
          const dias = diasPara(c.validadeLicenca)
          return (
            <Tr key={c.id}>
              <Td bold>{c.razaoSocial}</Td>
              <Td mono muted>{c.cnpj ?? '—'}</Td>
              <Td muted>
                <span style={{ display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.tiposResiduos.length > 0 ? c.tiposResiduos.join(', ') : '—'}
                </span>
              </Td>
              <Td muted>{c.licencaAmbiental ?? '—'}</Td>
              <Td>
                {dias === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencida ({fmt(c.validadeLicenca)})</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(c.validadeLicenca)} ({dias}d)</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">{fmt(c.validadeLicenca)}</Pill>
                }
              </Td>
              <Td align="center">
                <Pill color={c.status === 'ATIVO' ? '#16a34a' : '#64748b'} bg={c.status === 'ATIVO' ? '#f0fdf4' : '#f8fafc'}>
                  {c.status === 'ATIVO' ? 'Ativa' : 'Inativa'}
                </Pill>
              </Td>
              <Td>
                <Link href={`/meio-ambiente/coletoras/${c.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
