'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Download, FileSpreadsheet, BarChart3, FileText, Shield, Leaf, Award, Receipt, AlertTriangle, Users, Loader2, ArrowRight } from 'lucide-react'

type ReportKey = 'pendencias' | 'documentos' | 'taxas' | 'certificacoes' | 'tst' | 'meioambiente' | 'visaogeral' | 'responsavel'

interface RelConfig {
  key: ReportKey
  titulo: string
  descricao: string
  icon: React.ElementType
  color: string
  bg: string
  canExport: boolean
  href?: string
}

const relatorios: RelConfig[] = [
  { key: 'visaogeral',   titulo: 'Visão Geral por Empresa',      descricao: 'Dashboard completo de todos os módulos por empresa',       icon: BarChart3,      color: '#38bdf8', bg: 'rgba(56,189,248,.12)',  canExport: false },
  { key: 'tst',          titulo: 'TST — Segurança do Trabalho',  descricao: 'ASOs, EPIs, treinamentos, acidentes, extintores e CIPAA', icon: Shield,         color: '#6366f1', bg: 'rgba(99,102,241,.12)',  canExport: false, href: '/relatorios/sst' },
  { key: 'meioambiente', titulo: 'Meio Ambiente',                 descricao: 'Licenças, condicionantes, resíduos, PGRS e monitoramentos', icon: Leaf,           color: '#10b981', bg: 'rgba(16,185,129,.12)', canExport: false, href: '/relatorios/meio-ambiente' },
  { key: 'documentos',   titulo: 'Documentos Vencidos',          descricao: 'Todos os documentos com status vencido ou a vencer',       icon: FileText,       color: '#ef4444', bg: 'rgba(239,68,68,.12)',  canExport: true  },
  { key: 'taxas',        titulo: 'Taxas e Pagamentos',           descricao: 'Controle financeiro de taxas IBAMA, CETESB e municipais',  icon: Receipt,        color: '#f59e0b', bg: 'rgba(245,158,11,.12)', canExport: true  },
  { key: 'certificacoes',titulo: 'Certificações',                 descricao: 'Status e vencimentos de todas as certificações',           icon: Award,          color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', canExport: true  },
  { key: 'pendencias',   titulo: 'Pendências / Plano de Ação',   descricao: 'Relatório completo com prioridades e responsáveis',        icon: AlertTriangle,  color: '#f97316', bg: 'rgba(249,115,22,.12)', canExport: true  },
  { key: 'responsavel',  titulo: 'Por Responsável',              descricao: 'Pendências e tarefas agrupadas por responsável',           icon: Users,          color: '#06b6d4', bg: 'rgba(6,182,212,.12)',  canExport: false },
]

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

async function exportExcel(key: ReportKey) {
  const XLSX = (await import('xlsx')).default
  const data = await fetch(`/api/${key === 'pendencias' ? 'pendencias' : key === 'taxas' ? 'taxas' : key === 'certificacoes' ? 'certificacoes' : 'documentos'}`).then(r => r.json())

  let rows: Record<string, string>[] = []
  let sheetName: string = key

  if (key === 'pendencias') {
    rows = data.map((p: any) => ({
      'Descrição': p.descricao,
      'Empresa': p.empresa?.razaoSocial ?? '—',
      'Origem': p.origem,
      'Prioridade': p.prioridade,
      'Status': p.status,
      'Prazo': fmt(p.prazo),
      'Responsável': p.responsavel?.name ?? '—',
    }))
    sheetName = 'Pendencias'
  } else if (key === 'taxas') {
    rows = data.map((t: any) => ({
      'Tipo': t.tipo,
      'Órgão': t.orgao,
      'Empresa': t.empresa?.razaoSocial ?? '—',
      'Unidade': t.unidade?.nome ?? '—',
      'Competência': t.competencia ?? '—',
      'Vencimento': fmt(t.vencimento),
      'Valor': t.valor ? `R$ ${Number(t.valor).toFixed(2)}` : '—',
      'Status': t.status,
      'Responsável': t.responsavel ?? '—',
    }))
    sheetName = 'Taxas'
  } else if (key === 'certificacoes') {
    rows = data.map((c: any) => ({
      'Tipo': c.tipo,
      'Órgão Certificador': c.orgaoCertificador,
      'Empresa': c.empresa?.razaoSocial ?? '—',
      'Unidade': c.unidade?.nome ?? '—',
      'Emissão': fmt(c.emissao),
      'Vencimento': fmt(c.vencimento),
      'Status': c.status,
      'Responsável': c.responsavel ?? '—',
    }))
    sheetName = 'Certificacoes'
  } else if (key === 'documentos') {
    rows = data.map((d: any) => ({
      'Nome': d.nome,
      'Tipo': d.tipo,
      'Empresa': d.empresa?.razaoSocial ?? '—',
      'Unidade': d.unidade?.nome ?? '—',
      'Emissão': fmt(d.emissao),
      'Vencimento': fmt(d.vencimento),
      'Status': d.status,
      'Responsável': d.responsavel ?? '—',
    }))
    sheetName = 'Documentos'
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `GMTST_${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function exportPDF(key: ReportKey) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const data = await fetch(`/api/${key === 'pendencias' ? 'pendencias' : key === 'taxas' ? 'taxas' : key === 'certificacoes' ? 'certificacoes' : 'documentos'}`).then(r => r.json())

  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date().toLocaleDateString('pt-BR')

  let head: string[][] = []
  let body: string[][] = []
  let title = ''

  if (key === 'pendencias') {
    title = 'Relatório de Pendências / Plano de Ação'
    head = [['Descrição', 'Empresa', 'Origem', 'Prioridade', 'Status', 'Prazo', 'Responsável']]
    body = data.map((p: any) => [p.descricao, p.empresa?.razaoSocial ?? '—', p.origem, p.prioridade, p.status, fmt(p.prazo), p.responsavel?.name ?? '—'])
  } else if (key === 'taxas') {
    title = 'Relatório de Taxas e Pagamentos'
    head = [['Tipo', 'Órgão', 'Empresa', 'Competência', 'Vencimento', 'Valor', 'Status']]
    body = data.map((t: any) => [t.tipo, t.orgao, t.empresa?.razaoSocial ?? '—', t.competencia ?? '—', fmt(t.vencimento), t.valor ? `R$ ${Number(t.valor).toFixed(2)}` : '—', t.status])
  } else if (key === 'certificacoes') {
    title = 'Relatório de Certificações'
    head = [['Tipo', 'Órgão Certificador', 'Empresa', 'Unidade', 'Vencimento', 'Status']]
    body = data.map((c: any) => [c.tipo, c.orgaoCertificador, c.empresa?.razaoSocial ?? '—', c.unidade?.nome ?? '—', fmt(c.vencimento), c.status])
  } else if (key === 'documentos') {
    title = 'Relatório de Documentos Legais'
    head = [['Nome', 'Tipo', 'Empresa', 'Unidade', 'Vencimento', 'Status']]
    body = data.map((d: any) => [d.nome, d.tipo, d.empresa?.razaoSocial ?? '—', d.unidade?.nome ?? '—', fmt(d.vencimento), d.status])
  }

  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text(title, 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${now} · GMTST — Sistema de Gestão TST e Meio Ambiente`, 14, 23)

  autoTable(doc, {
    head,
    body,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [56, 189, 248], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })

  doc.save(`GMTST_${key}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState<{ key: ReportKey; type: 'pdf' | 'excel' } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleExport(key: ReportKey, type: 'pdf' | 'excel') {
    if (!relatorios.find(r => r.key === key)?.canExport) {
      showToast('Este relatório estará disponível em breve.')
      return
    }
    setLoading({ key, type })
    try {
      if (type === 'excel') await exportExcel(key)
      else await exportPDF(key)
    } catch (err) {
      console.error(err)
      showToast('Erro ao gerar relatório. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
          Relatórios
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Geração de relatórios em PDF e Excel
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: '#0f172a', color: '#f1f5f9',
            padding: '10px 18px', borderRadius: 10,
            fontSize: 13, fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,.3)',
            animation: 'fadeIn .2s ease',
          }}
        >
          {toast}
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {relatorios.map(r => {
          const isPdfLoading   = loading?.key === r.key && loading.type === 'pdf'
          const isExcelLoading = loading?.key === r.key && loading.type === 'excel'
          const isAnyLoading   = isPdfLoading || isExcelLoading

          return (
            <div
              key={r.key}
              className="rounded-xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                opacity: !r.canExport ? .75 : 1,
              }}
            >
              <div className="flex items-center justify-center rounded-xl mb-4" style={{ width: 44, height: 44, background: r.bg }}>
                <r.icon size={20} style={{ color: r.color }} />
              </div>

              <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{r.titulo}</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.descricao}</p>

              {r.href && (
                <Link
                  href={r.href}
                  className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold mb-2"
                  style={{ background: r.bg, color: r.color, border: `1px solid ${r.color}33` }}
                >
                  <ArrowRight size={12} />Ver Indicadores
                </Link>
              )}

              {!r.canExport && !r.href && (
                <p className="text-[10px] font-semibold mb-3" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Em breve
                </p>
              )}

              <div className="flex gap-2">
                <button
                  disabled={isAnyLoading}
                  onClick={() => handleExport(r.key, 'pdf')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-opacity"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid transparent', opacity: isAnyLoading && !isPdfLoading ? .5 : 1, cursor: isAnyLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isPdfLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  PDF
                </button>
                <button
                  disabled={isAnyLoading}
                  onClick={() => handleExport(r.key, 'excel')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-opacity"
                  style={{ background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid transparent', opacity: isAnyLoading && !isExcelLoading ? .5 : 1, cursor: isAnyLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isExcelLoading ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
                  Excel
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
