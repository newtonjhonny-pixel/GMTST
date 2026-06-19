import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { formatCurrency } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PENDENTE:  { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
  PAGO:      { bg: '#f0fdf4', text: '#16a34a', label: 'Pago' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' },
}

const COLS = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'orgao', label: 'Órgão' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'comp', label: 'Competência', width: '100px' },
  { key: 'venc', label: 'Vencimento', width: '100px' },
  { key: 'valor', label: 'Valor', width: '100px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'resp', label: 'Responsável' },
]

export default async function TaxasPage() {
  const taxas = await prisma.taxa.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })

  const vencidas  = taxas.filter(t => t.status === 'VENCIDO').length
  const pendentes = taxas.filter(t => t.status === 'PENDENTE').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Taxas e Pagamentos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {taxas.length} taxa{taxas.length !== 1 ? 's' : ''}
            {vencidas > 0  && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidas} vencida{vencidas !== 1 ? 's' : ''}</span>}
            {pendentes > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/taxas/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Taxa
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={taxas.length} empty={{ icon: '💳', message: 'Nenhuma taxa cadastrada' }}>
        {taxas.map(t => {
          const ss = STATUS_STYLE[t.status] ?? STATUS_STYLE.PENDENTE
          return (
            <Tr key={t.id}>
              <Td bold>{t.tipo}</Td>
              <Td>{t.orgao}</Td>
              <Td muted>{t.empresa.razaoSocial}</Td>
              <Td muted>{t.competencia ?? '—'}</Td>
              <Td>{fmt(t.vencimento)}</Td>
              <Td mono>{t.valor ? formatCurrency(Number(t.valor)) : '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td muted>{t.responsavel ?? '—'}</Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
