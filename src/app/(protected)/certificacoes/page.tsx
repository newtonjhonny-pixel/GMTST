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

function StatusBadge({ vencimento, alertaDias }: { vencimento: Date | null; alertaDias: number }) {
  const dias = diasPara(vencimento)
  if (dias === null) return <Pill color="#475569" bg="#f1f5f9">—</Pill>
  if (dias < 0)          return <Pill color="#dc2626" bg="#fef2f2">Vencida</Pill>
  if (dias <= alertaDias) return <Pill color="#d97706" bg="#fffbeb">Vence em {dias}d</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">Vigente</Pill>
}

const COLS = [
  { key: 'tipo', label: 'Tipo / Certificação' },
  { key: 'orgao', label: 'Órgão Certificador' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'emissao', label: 'Emissão', width: '100px' },
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'resp', label: 'Responsável' },
]

export default async function CertificacoesPage() {
  const certs = await prisma.certificacao.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })

  const vencidas = certs.filter(c => diasPara(c.vencimento) !== null && (diasPara(c.vencimento) ?? 0) < 0).length
  const aVencer  = certs.filter(c => { const d = diasPara(c.vencimento); return d !== null && d >= 0 && d <= 30 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Certificações
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {certs.length} certificaç{certs.length !== 1 ? 'ões' : 'ão'}&nbsp;&middot;&nbsp;
            {vencidas > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>{vencidas} vencida{vencidas !== 1 ? 's' : ''} &middot; </span>}
            {aVencer > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{aVencer} a vencer (30d)</span>}
          </p>
        </div>
        <Link
          href="/certificacoes/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Certificação
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={certs.length} empty={{ icon: '🏅', message: 'Nenhuma certificação cadastrada' }}>
        {certs.map(c => (
          <Tr key={c.id}>
            <Td bold>{c.tipo}</Td>
            <Td>{c.orgaoCertificador}</Td>
            <Td muted>{c.empresa.razaoSocial}</Td>
            <Td muted>{c.unidade.nome}</Td>
            <Td muted>{fmt(c.emissao)}</Td>
            <Td>{fmt(c.vencimento)}</Td>
            <Td><StatusBadge vencimento={c.vencimento} alertaDias={c.alertaDias} /></Td>
            <Td muted>{c.responsavel ?? '—'}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
