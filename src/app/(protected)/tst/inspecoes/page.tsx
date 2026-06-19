import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ABERTA:       { bg: '#fffbeb', text: '#d97706', label: 'Aberta' },
  EM_ANDAMENTO: { bg: '#eff6ff', text: '#2563eb', label: 'Em Andamento' },
  CONCLUIDA:    { bg: '#f0fdf4', text: '#16a34a', label: 'Concluída' },
}

const COLS = [
  { key: 'titulo', label: 'Título' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'data', label: 'Data', width: '100px' },
  { key: 'resp', label: 'Responsável' },
  { key: 'status', label: 'Status', width: '130px' },
]

export default async function InspecoesPage() {
  const inspecoes = await prisma.inspecaoSeguranca.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataInspecao: 'desc' },
  })

  const abertas  = inspecoes.filter(i => i.status === 'ABERTA').length
  const andamento = inspecoes.filter(i => i.status === 'EM_ANDAMENTO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Inspeções de Segurança
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {inspecoes.length} inspeção{inspecoes.length !== 1 ? 'ões' : ''}
            {abertas > 0   && <span style={{ color: '#d97706', fontWeight: 600 }}> · {abertas} aberta{abertas !== 1 ? 's' : ''}</span>}
            {andamento > 0 && <span style={{ color: '#2563eb', fontWeight: 600 }}> · {andamento} em andamento</span>}
          </p>
        </div>
        <Link
          href="/tst/inspecoes/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Inspeção
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={inspecoes.length} empty={{ icon: '🔍', message: 'Nenhuma inspeção registrada' }}>
        {inspecoes.map(i => {
          const ss = STATUS_STYLE[i.status] ?? STATUS_STYLE.ABERTA
          return (
            <Tr key={i.id}>
              <Td bold>{i.titulo}</Td>
              <Td>{i.empresa.razaoSocial}</Td>
              <Td muted>{i.unidade.nome}</Td>
              <Td muted>{fmt(i.dataInspecao)}</Td>
              <Td>{i.responsavel}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
