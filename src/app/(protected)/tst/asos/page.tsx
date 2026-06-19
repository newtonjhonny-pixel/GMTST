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

const TIPO: Record<string, string> = {
  ADMISSIONAL: 'Admissional', PERIODICO: 'Periódico', RETORNO: 'Retorno ao Trabalho',
  MUDANCA_RISCO: 'Mudança de Risco', DEMISSIONAL: 'Demissional',
}
const RESULTADO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APTO:              { bg: '#f0fdf4', text: '#16a34a', label: 'Apto' },
  INAPTO:            { bg: '#fef2f2', text: '#dc2626', label: 'Inapto' },
  APTO_COM_RESTRICAO:{ bg: '#fffbeb', text: '#d97706', label: 'Apto c/ Restrição' },
}

function VencBadge({ d }: { d: Date | null }) {
  const dias = diasPara(d)
  if (dias === null) return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
  if (dias < 0)   return <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
  if (dias <= 30) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const COLS = [
  { key: 'colab', label: 'Colaborador' },
  { key: 'tipo', label: 'Tipo', width: '140px' },
  { key: 'exame', label: 'Data Exame', width: '110px' },
  { key: 'venc', label: 'Vencimento' },
  { key: 'resultado', label: 'Resultado', width: '140px' },
  { key: 'medico', label: 'Médico' },
  { key: 'empresa', label: 'Empresa' },
]

export default async function AsosPage() {
  const asos = await prisma.aSO.findMany({
    include: { colaborador: { include: { unidade: { include: { empresa: true } } } } },
    orderBy: { dataExame: 'desc' },
  })

  const vencidos = asos.filter(a => (diasPara(a.dataVencimento) ?? 0) < 0).length
  const aVencer  = asos.filter(a => { const d = diasPara(a.dataVencimento); return d !== null && d >= 0 && d <= 30 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            ASOs — Atestados de Saúde Ocupacional
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {asos.length} ASO{asos.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer > 0  && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link
          href="/tst/asos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo ASO
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={asos.length} empty={{ icon: '📋', message: 'Nenhum ASO cadastrado' }}>
        {asos.map(a => {
          const rs = RESULTADO_STYLE[a.resultado] ?? RESULTADO_STYLE.APTO
          return (
            <Tr key={a.id}>
              <Td bold>{a.colaborador.nome}</Td>
              <Td>{TIPO[a.tipo] ?? a.tipo}</Td>
              <Td muted>{fmt(a.dataExame)}</Td>
              <Td><VencBadge d={a.dataVencimento} /></Td>
              <Td><Pill color={rs.text} bg={rs.bg}>{rs.label}</Pill></Td>
              <Td muted>{a.medico ?? '—'}</Td>
              <Td muted>{a.colaborador.unidade.empresa.razaoSocial}</Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
