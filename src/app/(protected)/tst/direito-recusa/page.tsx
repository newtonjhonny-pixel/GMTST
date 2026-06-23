import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const COLS = [
  { key: 'data',        label: 'Data',        width: '110px' },
  { key: 'empresa',     label: 'Empresa' },
  { key: 'colaborador', label: 'Colaborador' },
  { key: 'risco',       label: 'Risco Identificado' },
  { key: 'motivo',      label: 'Motivo da Recusa' },
  { key: 'resolvido',   label: 'Resolvido',   width: '100px', align: 'center' as const },
]

export default async function DireitoRecusaPage() {
  const registros = await prisma.direitoRecusa.findMany({
    include: { empresa: true, colaborador: true },
    orderBy: { data: 'desc' },
  })
  const pendentes = registros.filter(r => !r.resolvido).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Direito de Recusa — NR-1
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {registros.length} registro{registros.length !== 1 ? 's' : ''}
            {pendentes > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/tst/direito-recusa/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Registro
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={registros.length} empty={{ icon: '🚫', message: 'Nenhum registro de Direito de Recusa' }}>
        {registros.map(r => (
          <Tr key={r.id}>
            <Td muted>{fmt(r.data)}</Td>
            <Td bold>{r.empresa.razaoSocial}</Td>
            <Td>{r.colaborador.nome}</Td>
            <Td muted><span style={{ display:'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.descricaoRisco}</span></Td>
            <Td muted><span style={{ display:'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.motivoRecusa}</span></Td>
            <Td align="center">
              <Pill color={r.resolvido ? '#16a34a' : '#d97706'} bg={r.resolvido ? '#f0fdf4' : '#fffbeb'}>
                {r.resolvido ? 'Sim' : 'Pendente'}
              </Pill>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
