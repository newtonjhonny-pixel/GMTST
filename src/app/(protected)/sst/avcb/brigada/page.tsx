import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVO:     { bg: '#f0fdf4', text: '#16a34a', label: 'Ativa' },
  INATIVO:   { bg: '#fef2f2', text: '#dc2626', label: 'Inativa' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivada' },
}

const COLS = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'resp', label: 'Responsável' },
  { key: 'membros', label: 'Membros', width: '80px', align: 'center' as const },
  { key: 'treinamento', label: 'Treinamento', width: '110px' },
  { key: 'validade', label: 'Validade', width: '120px' },
  { key: 'status', label: 'Status', width: '90px' },
]

export default async function BrigadaPage() {
  const brigadas = await prisma.brigadaIncendio.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataValidade: 'asc' },
  })

  const vencidas = brigadas.filter(b => diasPara(b.dataValidade) !== null && diasPara(b.dataValidade)! < 0).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Brigada de Incêndio</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {brigadas.length} registro{brigadas.length !== 1 ? 's' : ''}
            {vencidas > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidas} vencida{vencidas !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/sst/avcb/brigada/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} /> Nova Brigada
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={brigadas.length} empty={{ icon: '👨‍🚒', message: 'Nenhuma brigada cadastrada' }}>
        {brigadas.map(b => {
          const ss = STATUS_STYLE[b.status] ?? STATUS_STYLE.ATIVO
          const dias = diasPara(b.dataValidade)
          return (
            <Tr key={b.id}>
              <Td bold>{b.empresa.razaoSocial}</Td>
              <Td muted>{b.unidade.nome}</Td>
              <Td>{b.responsavel}</Td>
              <Td align="center">{b.qtdMembros ?? '—'}</Td>
              <Td muted>{fmt(b.dataTreinamento)}</Td>
              <Td>
                {dias !== null && dias < 0
                  ? <Pill color="#dc2626" bg="#fef2f2">Vencida</Pill>
                  : dias !== null && dias <= 30
                    ? <Pill color="#d97706" bg="#fffbeb">{fmt(b.dataValidade)} ({dias}d)</Pill>
                    : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmt(b.dataValidade)}</span>}
              </Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
