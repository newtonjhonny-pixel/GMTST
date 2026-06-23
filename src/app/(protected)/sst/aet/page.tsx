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
  if (dias < 0)   return <Pill color="#dc2626" bg="#fef2f2">Vencida</Pill>
  if (dias <= 60) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Vencer' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencida' },
  CANCELADO: { bg: '#f8fafc', text: '#64748b', label: 'Cancelada' },
  ARQUIVADO: { bg: '#f8fafc', text: '#64748b', label: 'Arquivada' },
}

const COLS = [
  { key: 'empresa',    label: 'Empresa' },
  { key: 'unidade',   label: 'Unidade' },
  { key: 'resp',      label: 'Responsável Técnico' },
  { key: 'crea',      label: 'CREA',    width: '110px' },
  { key: 'emissao',   label: 'Emissão', width: '110px' },
  { key: 'vigencia',  label: 'Vigência' },
  { key: 'status',    label: 'Status',  width: '110px' },
]

export default async function AETPage() {
  const aets = await prisma.aET.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataEmissao: 'desc' },
  })
  const vencidas = aets.filter(a => a.status === 'VENCIDO').length
  const aVencer  = aets.filter(a => { const d = diasPara(a.vigencia); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            AET — Análise Ergonômica do Trabalho
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {aets.length} laudo{aets.length !== 1 ? 's' : ''}
            {vencidas > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidas} vencida{vencidas !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link href="/sst/aet/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Nova AET
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={aets.length} empty={{ icon: '🪑', message: 'Nenhuma AET cadastrada' }}>
        {aets.map(a => {
          const ss = STATUS_STYLE[a.status] ?? STATUS_STYLE.VIGENTE
          return (
            <Tr key={a.id}>
              <Td bold>{a.empresa.razaoSocial}</Td>
              <Td muted>{a.unidade.nome}</Td>
              <Td>{a.responsavelTecnico}</Td>
              <Td mono>{a.crea ?? '—'}</Td>
              <Td muted>{fmt(a.dataEmissao)}</Td>
              <Td><VencBadge d={a.vigencia} /></Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
