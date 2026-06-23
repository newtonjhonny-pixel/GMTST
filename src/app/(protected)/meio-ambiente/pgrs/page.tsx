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

const COLS = [
  { key: 'empresa',  label: 'Empresa' },
  { key: 'unidade',  label: 'Unidade' },
  { key: 'versao',   label: 'Versão',   width: '80px' },
  { key: 'vigencia', label: 'Vigência' },
  { key: 'revisao',  label: 'Revisão'  },
  { key: 'resp',     label: 'Responsável' },
  { key: 'status',   label: 'Situação', width: '110px', align: 'center' as const },
]

export default async function PGRSPage() {
  const pgrs = await prisma.pGRSAmbiental.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataVigencia: 'desc' },
  })

  const vencidos = pgrs.filter(p => (diasPara(p.dataVigencia) ?? 1) < 0).length
  const aVencer  = pgrs.filter(p => { const d = diasPara(p.dataVigencia); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            PGRS — Plano de Gerenciamento de Resíduos Sólidos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {pgrs.length} plano{pgrs.length !== 1 ? 's' : ''} cadastrado{pgrs.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer em 60d</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/pgrs/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo PGRS
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={pgrs.length} empty={{ icon: '♻️', message: 'Nenhum PGRS cadastrado' }}>
        {pgrs.map(p => {
          const dias = diasPara(p.dataVigencia)
          return (
            <Tr key={p.id}>
              <Td bold>{p.empresa.razaoSocial}</Td>
              <Td muted>{p.unidade.nome} — {p.unidade.cidade}/{p.unidade.uf}</Td>
              <Td mono>{p.versao}</Td>
              <Td muted>{fmt(p.dataElaboracao)} → {fmt(p.dataVigencia)}</Td>
              <Td muted>{p.dataRevisao ? fmt(p.dataRevisao) : '—'}</Td>
              <Td muted>{p.responsavel ?? '—'}</Td>
              <Td align="center">
                {p.status !== 'ATIVO'
                  ? <Pill color="#64748b" bg="#f8fafc">Inativo</Pill>
                  : dias === null || dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{dias}d restantes</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">Vigente</Pill>
                }
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
