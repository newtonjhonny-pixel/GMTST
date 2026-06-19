import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function VencBadge({ d }: { d: Date | null }) {
  const dias = diasPara(d)
  if (dias === null) return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
  if (dias < 0)  return <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
  if (dias <= 30) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const COLS = [
  { key: 'colaborador', label: 'Colaborador' },
  { key: 'epi', label: 'EPI' },
  { key: 'ca', label: 'CA Nº', width: '100px' },
  { key: 'entrega', label: 'Entrega', width: '110px' },
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'qtd', label: 'Qtd.', width: '60px', align: 'center' as const },
  { key: 'empresa', label: 'Empresa' },
]

export default async function EpisPage() {
  const entregas = await prisma.entregaEPI.findMany({
    include: {
      colaborador: { include: { unidade: { include: { empresa: true } } } },
      epi: true,
    },
    orderBy: { dataEntrega: 'desc' },
  })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Entrega de EPIs
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {entregas.length} entrega{entregas.length !== 1 ? 's' : ''} registrada{entregas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/tst/epis/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Entrega
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={entregas.length} empty={{ icon: '⛑', message: 'Nenhuma entrega de EPI registrada' }}>
        {entregas.map(e => (
          <Tr key={e.id}>
            <Td bold>{e.colaborador.nome}</Td>
            <Td>{e.epi.nome}</Td>
            <Td mono>{e.epi.ca}</Td>
            <Td muted>{fmt(e.dataEntrega)}</Td>
            <Td><VencBadge d={e.dataVencimento} /></Td>
            <Td align="center">{e.quantidade}</Td>
            <Td muted>{e.colaborador.unidade.empresa.razaoSocial}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
