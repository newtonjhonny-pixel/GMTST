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
  if (dias <= 60) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const TIPO_LABEL: Record<string, string> = {
  INSALUBRIDADE: 'Insalubridade', PERICULOSIDADE: 'Periculosidade', AMBOS: 'Ambos',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Vencer' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  CANCELADO: { bg: '#f8fafc', text: '#64748b', label: 'Cancelado' },
  ARQUIVADO: { bg: '#f8fafc', text: '#64748b', label: 'Arquivado' },
}

const COLS = [
  { key: 'empresa',  label: 'Empresa' },
  { key: 'unidade',  label: 'Unidade' },
  { key: 'tipo',     label: 'Tipo',   width: '140px' },
  { key: 'grau',     label: 'Grau / Adicional', width: '140px' },
  { key: 'resp',     label: 'Responsável Técnico' },
  { key: 'emissao',  label: 'Emissão',  width: '110px' },
  { key: 'vigencia', label: 'Vigência' },
  { key: 'status',   label: 'Status',   width: '110px' },
]

export default async function LIPPage() {
  const lips = await prisma.lIP.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataEmissao: 'desc' },
  })
  const vencidos = lips.filter(l => l.status === 'VENCIDO').length
  const aVencer  = lips.filter(l => { const d = diasPara(l.vigencia); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            LIP — Laudo de Insalubridade e Periculosidade
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {lips.length} laudo{lips.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link href="/sst/lip/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo LIP
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={lips.length} empty={{ icon: '⚗️', message: 'Nenhum LIP cadastrado' }}>
        {lips.map(l => {
          const ss = STATUS_STYLE[l.status] ?? STATUS_STYLE.VIGENTE
          return (
            <Tr key={l.id}>
              <Td bold>{l.empresa.razaoSocial}</Td>
              <Td muted>{l.unidade.nome}</Td>
              <Td><Pill color="#185FA5" bg="#E6F1FB">{TIPO_LABEL[l.tipo]}</Pill></Td>
              <Td muted>{l.grau ? `${l.grau}${l.adicionalPercent ? ` — ${l.adicionalPercent}%` : ''}` : '—'}</Td>
              <Td>{l.responsavelTecnico}</Td>
              <Td muted>{fmt(l.dataEmissao)}</Td>
              <Td><VencBadge d={l.vigencia} /></Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
