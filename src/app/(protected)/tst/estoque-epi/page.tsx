import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, PackagePlus } from 'lucide-react'
import Link from 'next/link'

const COLS = [
  { key: 'ca',        label: 'CA',          width: '80px' },
  { key: 'nome',      label: 'EPI' },
  { key: 'empresa',   label: 'Empresa' },
  { key: 'categoria', label: 'Categoria',   width: '130px' },
  { key: 'saldo',     label: 'Estoque',     width: '90px', align: 'center' as const },
  { key: 'validade',  label: 'Validade CA', width: '110px' },
  { key: 'situacao',  label: 'Situação',    width: '100px', align: 'center' as const },
  { key: 'acoes',     label: '', width: '50px' },
]

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export default async function EstoqueEpiPage() {
  const hoje  = new Date()
  const em60d = new Date(hoje.getTime() + 60 * 86400000)

  const epis = await prisma.ePI.findMany({
    where: { status: 'ATIVO' },
    include: {
      empresa: { select: { razaoSocial: true } },
      _count: { select: { estoqueMovimentos: true } },
    },
    orderBy: { nome: 'asc' },
  })

  const quantidadeTotalEstoque = epis.reduce((sum, e) => sum + e.quantidadeEstoque, 0)
  const abaixoMinimo = epis.filter(e => e.quantidadeEstoque < e.estoqueMinimo).length
  const caVencidos = epis.filter(e => e.validade && e.validade < hoje).length
  const caVencendo = epis.filter(e => e.validade && e.validade >= hoje && e.validade <= em60d).length
  const semMovimentacao = epis.filter(e => e._count.estoqueMovimentos === 0).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Estoque de EPIs
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {epis.length} EPI{epis.length !== 1 ? 's' : ''} cadastrado{epis.length !== 1 ? 's' : ''} · cadastro mestre de equipamentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tst/estoque-epi/movimento" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
            <PackagePlus size={14} />Registrar Movimento
          </Link>
          <Link href="/tst/estoque-epi/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
            <Plus size={14} />Novo EPI
          </Link>
        </div>
      </div>

      {/* Dashboard resumo */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Quantidade em Estoque', value: quantidadeTotalEstoque, color: '#0891b2', bg: '#ecfeff' },
          { label: 'Abaixo do Mínimo', value: abaixoMinimo, color: '#d97706', bg: '#fffbeb' },
          { label: 'CA Vencidos', value: caVencidos, color: '#dc2626', bg: '#fef2f2' },
          { label: 'CA Vencendo (60d)', value: caVencendo, color: '#ca8a04', bg: '#fefce8' },
          { label: 'Sem Movimentação', value: semMovimentacao, color: '#64748b', bg: '#f1f5f9' },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            <p className="text-2xl font-extrabold" style={{ color: card.value > 0 ? card.color : 'var(--text-primary)' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <DataTable columns={COLS} rowCount={epis.length} empty={{ icon: '🦺', message: 'Nenhum EPI cadastrado no estoque' }}>
        {epis.map(e => {
          const dias = diasPara(e.validade)
          const vencido = dias !== null && dias < 0
          const vencendo = dias !== null && dias >= 0 && dias <= 60
          const baixo = e.quantidadeEstoque < e.estoqueMinimo
          return (
            <Tr key={e.id}>
              <Td mono muted>{e.ca}</Td>
              <Td bold>{e.nome}</Td>
              <Td muted>{e.empresa?.razaoSocial ?? '—'}</Td>
              <Td muted>{e.categoria ?? '—'}</Td>
              <Td align="center">
                <span style={{ fontWeight: 700, fontSize: 15, color: e.quantidadeEstoque <= 0 ? '#dc2626' : baixo ? '#d97706' : 'var(--text-primary)' }}>
                  {e.quantidadeEstoque}
                </span>
              </Td>
              <Td>
                {!e.validade ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : vencido ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                  : vencendo ? <Pill color="#ca8a04" bg="#fefce8">{fmt(e.validade)}</Pill>
                  : <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(e.validade)}</span>}
              </Td>
              <Td align="center">
                {e.quantidadeEstoque <= 0
                  ? <Pill color="#dc2626" bg="#fef2f2">Zerado</Pill>
                  : baixo
                    ? <Pill color="#d97706" bg="#fffbeb">Baixo</Pill>
                    : <Pill color="#16a34a" bg="#f0fdf4">Normal</Pill>
                }
              </Td>
              <Td>
                <Link href={`/tst/estoque-epi/${e.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
