import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const COLS = [
  { key: 'ca',       label: 'CA',          width: '80px' },
  { key: 'nome',     label: 'EPI' },
  { key: 'empresa',  label: 'Empresa' },
  { key: 'saldo',    label: 'Saldo',       width: '80px', align: 'center' as const },
  { key: 'situacao', label: 'Situação',    width: '100px', align: 'center' as const },
]

export default async function EstoqueEpiPage() {
  const movimentos = await prisma.estoqueEPI.findMany({
    include: { epi: true, empresa: true },
    orderBy: { dataMovimento: 'desc' },
  })

  // Agrupamento por epi + empresa
  const mapa = new Map<string, { nome: string; ca: string; empresa: string; saldo: number }>()
  for (const m of movimentos) {
    const key = `${m.epiId}__${m.empresaId}`
    if (!mapa.has(key)) mapa.set(key, { nome: m.epi.nome, ca: m.epi.ca, empresa: m.empresa.razaoSocial, saldo: 0 })
    const entry = mapa.get(key)!
    if (m.tipo === 'ENTRADA') entry.saldo += m.quantidade
    else if (m.tipo === 'SAIDA') entry.saldo -= m.quantidade
    else entry.saldo = m.quantidade // AJUSTE substitui
  }

  const itens = Array.from(mapa.entries()).map(([key, v]) => ({ key, ...v }))
  const criticos = itens.filter(e => e.saldo <= 0).length
  const baixos   = itens.filter(e => e.saldo > 0 && e.saldo <= 5).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Estoque de EPIs
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {itens.length} EPI{itens.length !== 1 ? 's' : ''} com movimentação
            {criticos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {criticos} sem estoque</span>}
            {baixos   > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {baixos} com estoque baixo</span>}
          </p>
        </div>
        <Link href="/tst/estoque-epi/movimento" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Registrar Movimento
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={itens.length} empty={{ icon: '🦺', message: 'Nenhum movimento de estoque registrado' }}>
        {itens.map(e => (
          <Tr key={e.key}>
            <Td mono muted>{e.ca ?? '—'}</Td>
            <Td bold>{e.nome}</Td>
            <Td muted>{e.empresa}</Td>
            <Td align="center">
              <span style={{ fontWeight: 700, fontSize: 15, color: e.saldo <= 0 ? '#dc2626' : e.saldo <= 5 ? '#d97706' : 'var(--text-primary)' }}>
                {e.saldo}
              </span>
            </Td>
            <Td align="center">
              {e.saldo <= 0
                ? <Pill color="#dc2626" bg="#fef2f2">Zerado</Pill>
                : e.saldo <= 5
                  ? <Pill color="#d97706" bg="#fffbeb">Baixo</Pill>
                  : <Pill color="#16a34a" bg="#f0fdf4">Normal</Pill>
              }
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
