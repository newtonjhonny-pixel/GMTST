import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const COLS = [
  { key: 'desc', label: 'Resíduo' },
  { key: 'ibama', label: 'Cód. IBAMA', width: '110px' },
  { key: 'classe', label: 'Classe', width: '80px' },
  { key: 'qtd', label: 'Quantidade', width: '110px' },
  { key: 'geracao', label: 'Geração', width: '100px' },
  { key: 'dest', label: 'Destinação' },
  { key: 'mtr', label: 'MTR', width: '100px' },
]

export default async function ResiduosPage() {
  const residuos = await prisma.controleResiduo.findMany({ orderBy: { dataGeracao: 'desc' } })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Controle de Resíduos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {residuos.length} registro{residuos.length !== 1 ? 's' : ''} · MTR, destinação e certificados
          </p>
        </div>
        <Link
          href="/meio-ambiente/residuos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Registro
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={residuos.length} empty={{ icon: '♻️', message: 'Nenhum registro de resíduo' }}>
        {residuos.map(r => (
          <Tr key={r.id}>
            <Td bold>{r.descricao}</Td>
            <Td mono>{r.codigoIBAMA ?? '—'}</Td>
            <Td>{r.classeRisco ?? '—'}</Td>
            <Td>{r.quantidade} {r.unidadeMedida}</Td>
            <Td muted>{fmt(r.dataGeracao)}</Td>
            <Td>{r.destinacao}</Td>
            <Td mono>{r.mtr ?? '—'}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
