import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const COLS = [
  { key: 'nome', label: 'Nome / Produto' },
  { key: 'cas', label: 'CAS', width: '90px' },
  { key: 'forn', label: 'Fornecedor' },
  { key: 'riscos', label: 'Riscos' },
  { key: 'epis', label: 'EPIs Necessários' },
  { key: 'fispq', label: 'FISPQ', width: '80px' },
  { key: 'acoes', label: '', width: '50px' },
]

export default async function ProdutosQuimicosPage() {
  const produtos = await prisma.produtoQuimico.findMany({ orderBy: { nome: 'asc' } })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Produtos Químicos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {produtos.length} produto{produtos.length !== 1 ? 's' : ''} · FISPQs e controle de riscos
          </p>
        </div>
        <Link
          href="/meio-ambiente/produtos-quimicos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Produto
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={produtos.length} empty={{ icon: '🧪', message: 'Nenhum produto químico cadastrado' }}>
        {produtos.map(p => (
          <Tr key={p.id}>
            <Td bold>{p.nome}</Td>
            <Td mono>{p.cas ?? '—'}</Td>
            <Td muted>{p.fornecedor ?? '—'}</Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {p.riscos.map(r => (
                  <Pill key={r} color="#dc2626" bg="#fef2f2">{r}</Pill>
                ))}
                {p.riscos.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </div>
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {p.epi.map(e => (
                  <Pill key={e} color="#2563eb" bg="#eff6ff">{e}</Pill>
                ))}
                {p.epi.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </div>
            </Td>
            <Td>
              {p.fispq
                ? <a href={p.fispq} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: 'var(--brand-from)' }}>Ver FISPQ</a>
                : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
              }
            </Td>
            <Td>
              <Link href={`/meio-ambiente/produtos-quimicos/${p.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
