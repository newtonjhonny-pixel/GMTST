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
  LP: 'LP', LI: 'LI', LO: 'LO', LAS: 'LAS',
  OUTORGA: 'Outorga', CTF_IBAMA: 'CTF/IBAMA', AUTORIZACAO: 'Autorização', OUTRO: 'Outro',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencida' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Renovar' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelada' },
}

function VencBadge({ d, status }: { d: Date | null; status: string }) {
  const ss = STATUS_STYLE[status] ?? STATUS_STYLE.VIGENTE
  const dias = diasPara(d)
  const extra = dias !== null && dias > 0 && dias <= 30 ? ` (${dias}d)` : ''
  return <Pill color={ss.text} bg={ss.bg}>{ss.label}{extra}</Pill>
}

const COLS = [
  { key: 'tipo', label: 'Tipo', width: '80px' },
  { key: 'orgao', label: 'Órgão Emissor' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'numero', label: 'Número', width: '120px' },
  { key: 'emissao', label: 'Emissão', width: '100px' },
  { key: 'vencimento', label: 'Vencimento', width: '110px' },
  { key: 'status', label: 'Status', width: '130px' },
]

export default async function LicencasPage() {
  const licencas = await prisma.licencaAmbiental.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })

  const vencidas = licencas.filter(l => l.status === 'VENCIDO').length
  const aRenovar = licencas.filter(l => l.status === 'A_VENCER').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Licenças Ambientais
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {licencas.length} licença{licencas.length !== 1 ? 's' : ''}
            {vencidas > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidas} vencida{vencidas !== 1 ? 's' : ''}</span>}
            {aRenovar > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aRenovar} a renovar</span>}
          </p>
        </div>
        <Link
          href="/meio-ambiente/licencas/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Licença
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={licencas.length} empty={{ icon: '📄', message: 'Nenhuma licença cadastrada' }}>
        {licencas.map(l => (
          <Tr key={l.id}>
            <Td>
              <span
                className="font-bold text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}
              >
                {TIPO[l.tipo] ?? l.tipo}
              </span>
            </Td>
            <Td bold>{l.orgao}</Td>
            <Td muted>{l.empresa.razaoSocial}</Td>
            <Td muted>{l.unidade.nome}</Td>
            <Td mono>{l.numero ?? '—'}</Td>
            <Td muted>{fmt(l.emissao)}</Td>
            <Td>{fmt(l.vencimento)}</Td>
            <Td><VencBadge d={l.vencimento} status={l.status} /></Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
