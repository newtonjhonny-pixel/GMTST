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
  if (dias < 0)   return <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
  if (dias <= 30) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const COLS = [
  { key: 'nome', label: 'Nome / Treinamento' },
  { key: 'tipo', label: 'Tipo', width: '120px' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'realizacao', label: 'Realização', width: '110px' },
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'ch', label: 'CH (h)', width: '70px' },
  { key: 'part', label: 'Participantes', width: '110px' },
]

export default async function TreinamentosPage() {
  const treinamentos = await prisma.treinamento.findMany({
    include: { empresa: true, unidade: true, _count: { select: { colaboradores: true } } },
    orderBy: { dataRealizacao: 'desc' },
  })

  const vencidos = treinamentos.filter(t => (diasPara(t.dataVencimento) ?? 0) < 0).length
  const aVencer  = treinamentos.filter(t => { const d = diasPara(t.dataVencimento); return d !== null && d >= 0 && d <= 30 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Treinamentos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {treinamentos.length} treinamento{treinamentos.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer > 0  && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link
          href="/tst/treinamentos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Treinamento
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={treinamentos.length} empty={{ icon: '📚', message: 'Nenhum treinamento cadastrado' }}>
        {treinamentos.map(t => (
          <Tr key={t.id}>
            <Td bold>{t.nome}</Td>
            <Td>{t.tipo}</Td>
            <Td muted>{t.empresa.razaoSocial}</Td>
            <Td muted>{fmt(t.dataRealizacao)}</Td>
            <Td><VencBadge d={t.dataVencimento} /></Td>
            <Td align="center">{t.cargaHoraria ?? '—'}</Td>
            <Td align="center">{t._count.colaboradores}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
