'use client'
import { useEffect, useState, useCallback } from 'react'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Empresa = { id: string; razaoSocial: string }
type Registro = {
  id: string; data: string; material: string; quantidade: number; unidadeMedida: string
  destinacao: string | null
  empresa: { razaoSocial: string }; unidade: { nome: string }; coletor: { razaoSocial: string } | null
}

const MAT_INFO: Record<string, { label: string; color: string; bg: string }> = {
  PAPEL:      { label: 'Papel',      color: '#185FA5', bg: '#E6F1FB' },
  PLASTICO:   { label: 'Plástico',   color: '#d97706', bg: '#fffbeb' },
  VIDRO:      { label: 'Vidro',      color: '#0891b2', bg: '#ecfeff' },
  METAL:      { label: 'Metal',      color: '#64748b', bg: '#f1f5f9' },
  ORGANICO:   { label: 'Orgânico',   color: '#16a34a', bg: '#f0fdf4' },
  MADEIRA:    { label: 'Madeira',    color: '#92400e', bg: '#fef3c7' },
  ELETRONICO: { label: 'Eletrônico', color: '#7c3aed', bg: '#f5f3ff' },
  PILHAS:     { label: 'Pilhas',     color: '#be123c', bg: '#fff1f2' },
  LAMPADAS:   { label: 'Lâmpadas',   color: '#0369a1', bg: '#e0f2fe' },
  REJEITO:    { label: 'Rejeito',    color: '#dc2626', bg: '#fef2f2' },
  OUTRO:      { label: 'Outro',      color: '#64748b', bg: '#f8fafc' },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

async function exportExcel(rows: Registro[]) {
  const XLSX = (await import('xlsx')).default
  const sheet = rows.map(r => ({
    'Data': fmt(r.data),
    'Empresa': r.empresa.razaoSocial,
    'Unidade': r.unidade.nome,
    'Material': MAT_INFO[r.material]?.label ?? r.material,
    'Quantidade': `${r.quantidade} ${r.unidadeMedida}`,
    'Destinação': r.destinacao ?? '—',
    'Coletora': r.coletor?.razaoSocial ?? '—',
  }))
  const ws = XLSX.utils.json_to_sheet(sheet)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Coleta_Seletiva')
  XLSX.writeFile(wb, `GestaoTST_Coleta_Seletiva_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function exportPDF(rows: Registro[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text('Relatório de Coleta Seletiva', 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · GestãoTST`, 14, 23)
  autoTable(doc, {
    head: [['Data', 'Empresa', 'Unidade', 'Material', 'Quantidade', 'Destinação', 'Coletora']],
    body: rows.map(r => [fmt(r.data), r.empresa.razaoSocial, r.unidade.nome, MAT_INFO[r.material]?.label ?? r.material, `${r.quantidade} ${r.unidadeMedida}`, r.destinacao ?? '—', r.coletor?.razaoSocial ?? '—']),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })
  doc.save(`GestaoTST_Coleta_Seletiva_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export default function ColetaSeletivaPage() {
  const [rows, setRows] = useState<Registro[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)
  const [material, setMaterial] = useState('')
  const [empresaId, setEmpresaId] = useState('')

  useEffect(() => { fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas) }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (material) params.set('material', material)
    if (empresaId) params.set('empresaId', empresaId)
    const res = await fetch(`/api/meio-ambiente/coleta-seletiva?${params.toString()}`)
    const data = await res.json()
    setRows(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [material, empresaId])

  useEffect(() => { carregar() }, [carregar])

  const totais: Record<string, number> = {}
  for (const r of rows) totais[r.material] = (totais[r.material] ?? 0) + r.quantidade

  return (
    <div className="print:p-0">
      <div className="flex items-end justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Coleta Seletiva
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {rows.length} registro{rows.length !== 1 ? 's' : ''}
            {Object.entries(totais).map(([mat, qtd]) => (
              <span key={mat} style={{ marginLeft: 8, color: MAT_INFO[mat]?.color ?? 'var(--text-muted)', fontWeight: 600 }}>
                · {MAT_INFO[mat]?.label ?? mat}: {qtd.toFixed(1)} kg
              </span>
            ))}
          </p>
        </div>
        <Link href="/meio-ambiente/coleta-seletiva/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Registro
        </Link>
      </div>

      <div className="rounded-xl p-4 mb-4 print:hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <select className="form-select" value={material} onChange={e => setMaterial(e.target.value)}>
            <option value="">Todos os materiais</option>
            {Object.entries(MAT_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
          { key: 'data',      label: 'Data',      width: '110px' },
          { key: 'empresa',   label: 'Empresa' },
          { key: 'unidade',   label: 'Unidade' },
          { key: 'material',  label: 'Material',  width: '110px' },
          { key: 'qtd',       label: 'Quantidade', width: '120px', align: 'center' as const },
          { key: 'dest',      label: 'Destinação' },
          { key: 'coletor',   label: 'Coletora',  width: '160px' },
          { key: 'acoes',     label: '',          width: '50px' },
        ]}
        rowCount={loading ? 1 : rows.length}
        empty={{ icon: '♻️', message: loading ? 'Carregando...' : 'Nenhum registro de coleta seletiva' }}
      >
        {!loading && rows.map(r => (
          <Tr key={r.id}>
            <Td muted>{fmt(r.data)}</Td>
            <Td bold>{r.empresa.razaoSocial}</Td>
            <Td muted>{r.unidade.nome}</Td>
            <Td>
              <Pill color={MAT_INFO[r.material]?.color ?? '#64748b'} bg={MAT_INFO[r.material]?.bg ?? '#f8fafc'}>
                {MAT_INFO[r.material]?.label ?? r.material}
              </Pill>
            </Td>
            <Td align="center">
              <span style={{ fontWeight: 700 }}>{r.quantidade} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{r.unidadeMedida}</span></span>
            </Td>
            <Td muted>{r.destinacao ?? '—'}</Td>
            <Td muted>{r.coletor?.razaoSocial ?? '—'}</Td>
            <Td>
              <Link href={`/meio-ambiente/coleta-seletiva/${r.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
