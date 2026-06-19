import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
  ARQUIVADO: { bg: '#eff6ff', text: '#2563eb', label: 'Arquivado' },
}

const COLS = [
  { key: 'titulo', label: 'Título' },
  { key: 'tipo', label: 'Tipo', width: '100px' },
  { key: 'orgao', label: 'Órgão' },
  { key: 'periodo', label: 'Período', width: '90px' },
  { key: 'prazo', label: 'Prazo', width: '100px' },
  { key: 'envio', label: 'Envio', width: '100px' },
  { key: 'status', label: 'Status', width: '110px' },
]

export default async function RelatoriosAmbientaisPage() {
  const relatorios = await prisma.relatorioAmbiental.findMany({ orderBy: { createdAt: 'desc' } })

  const pendentes = relatorios.filter(r => r.status === 'A_VENCER').length
  const vencidos  = relatorios.filter(r => r.status === 'VENCIDO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Relatórios Ambientais
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {relatorios.length} relatório{relatorios.length !== 1 ? 's' : ''}
            {vencidos > 0   && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {pendentes > 0  && <span style={{ color: '#d97706', fontWeight: 600 }}> · {pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/meio-ambiente/relatorios/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Relatório
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={relatorios.length} empty={{ icon: '📄', message: 'Nenhum relatório ambiental cadastrado' }}>
        {relatorios.map(r => {
          const ss = STATUS_STYLE[r.status] ?? STATUS_STYLE.PENDENTE
          return (
            <Tr key={r.id}>
              <Td bold>{r.titulo}</Td>
              <Td>{r.tipo}</Td>
              <Td muted>{r.orgao ?? '—'}</Td>
              <Td muted>{r.periodo}</Td>
              <Td>{fmt(r.prazo)}</Td>
              <Td muted>{fmt(r.dataEnvio)}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
