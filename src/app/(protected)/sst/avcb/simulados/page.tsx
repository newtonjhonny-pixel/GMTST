import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PENDENTE:  { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
  REALIZADO: { bg: '#f0fdf4', text: '#16a34a', label: 'Realizado' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' },
}

const COLS = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'prevista', label: 'Data Prevista', width: '120px' },
  { key: 'realizacao', label: 'Data Realização', width: '130px' },
  { key: 'participantes', label: 'Participantes', width: '100px', align: 'center' as const },
  { key: 'status', label: 'Status', width: '100px' },
]

export default async function SimuladosPage() {
  const simulados = await prisma.simuladoIncendio.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataPrevista: 'asc' },
  })

  const pendentes = simulados.filter(s => s.status === 'PENDENTE').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Simulados de Incêndio</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {simulados.length} registro{simulados.length !== 1 ? 's' : ''}
            {pendentes > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/sst/avcb/simulados/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} /> Novo Simulado
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={simulados.length} empty={{ icon: '🚨', message: 'Nenhum simulado cadastrado' }}>
        {simulados.map(s => {
          const ss = STATUS_STYLE[s.status] ?? STATUS_STYLE.PENDENTE
          return (
            <Tr key={s.id}>
              <Td bold>{s.empresa.razaoSocial}</Td>
              <Td muted>{s.unidade.nome}</Td>
              <Td muted>{fmt(s.dataPrevista)}</Td>
              <Td muted>{fmt(s.dataRealizacao)}</Td>
              <Td align="center">{s.participantes ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
