import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR')
}

const COLS = [
  { key: 'colaborador', label: 'Colaborador' },
  { key: 'empresa',      label: 'Empresa' },
  { key: 'unidade',      label: 'Unidade' },
  { key: 'entrega',      label: 'Data da Entrega', width: '130px' },
  { key: 'itens',        label: 'Qtd. Itens',      width: '90px', align: 'center' as const },
  { key: 'vencidos',     label: 'Itens Vencidos',  width: '110px', align: 'center' as const },
  { key: 'status',       label: 'Status',          width: '90px', align: 'center' as const },
  { key: 'acoes',        label: '',                width: '50px' },
]

export default async function FichasEpiPage() {
  const fichas = await prisma.fichaEntregaEPI.findMany({
    include: {
      colaborador: true,
      empresa: true,
      unidade: true,
      itens: { where: { ativo: true }, include: { epi: true } },
    },
    orderBy: { dataEntrega: 'desc' },
  })

  const fichasAtivas = fichas.filter(f => f.status === 'ATIVA').length
  const totalVencidos = fichas.reduce((acc, f) => acc + f.itens.filter(i => (diasPara(i.dataVencimento) ?? 1) < 0).length, 0)

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Controle de EPIs — Fichas de Entrega
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {fichas.length} ficha{fichas.length !== 1 ? 's' : ''} · {fichasAtivas} ativa{fichasAtivas !== 1 ? 's' : ''}
            {totalVencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {totalVencidos} item(ns) vencido(s)</span>}
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

      <DataTable columns={COLS} rowCount={fichas.length} empty={{ icon: '⛑', message: 'Nenhuma ficha de entrega de EPI registrada' }}>
        {fichas.map(f => {
          const vencidos = f.itens.filter(i => (diasPara(i.dataVencimento) ?? 1) < 0).length
          return (
            <Tr key={f.id}>
              <Td bold>{f.colaborador.nome}</Td>
              <Td muted>{f.empresa.razaoSocial}</Td>
              <Td muted>{f.unidade.nome}</Td>
              <Td>{fmt(f.dataEntrega)}</Td>
              <Td align="center">{f.itens.length}</Td>
              <Td align="center">
                {vencidos > 0 ? <Pill color="#dc2626" bg="#fef2f2">{vencidos}</Pill> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>0</span>}
              </Td>
              <Td align="center">
                <Pill color={f.status === 'ATIVA' ? '#16a34a' : '#64748b'} bg={f.status === 'ATIVA' ? '#f0fdf4' : '#f8fafc'}>
                  {f.status === 'ATIVA' ? 'Ativa' : 'Inativa'}
                </Pill>
              </Td>
              <Td>
                <Link href={`/tst/epis/${f.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
