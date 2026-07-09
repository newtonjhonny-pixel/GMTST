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
  PENDENTE:  { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
  EM_DIA:    { bg: '#f0fdf4', text: '#16a34a', label: 'Em dia' },
  ATRASADA:  { bg: '#fef2f2', text: '#dc2626', label: 'Atrasada' },
  CONCLUIDA: { bg: '#f1f5f9', text: '#475569', label: 'Concluída' },
}

const COLS = [
  { key: 'licenca', label: 'Licença' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'descricao', label: 'Condicionante' },
  { key: 'periodicidade', label: 'Periodicidade', width: '110px' },
  { key: 'prazo', label: 'Prazo', width: '100px' },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'acoes', label: '', width: '50px' },
]

export default async function CondicionantesPage() {
  const condicionantes = await prisma.condicionante.findMany({
    include: { licenca: { include: { empresa: true, unidade: true } } },
    orderBy: { prazo: 'asc' },
  })

  const atrasadas = condicionantes.filter(c => c.status === 'ATRASADA').length
  const pendentes = condicionantes.filter(c => c.status === 'PENDENTE').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Condicionantes Ambientais
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {condicionantes.length} condicionante{condicionantes.length !== 1 ? 's' : ''}
            {atrasadas > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {atrasadas} atrasada{atrasadas !== 1 ? 's' : ''}</span>}
            {pendentes > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/meio-ambiente/condicionantes/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova Condicionante
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={condicionantes.length} empty={{ icon: '📋', message: 'Nenhuma condicionante cadastrada' }}>
        {condicionantes.map(c => {
          const ss = STATUS_STYLE[c.status] ?? STATUS_STYLE.PENDENTE
          const dias = diasPara(c.prazo)
          const vencendo = dias !== null && dias >= 0 && dias <= 15
          return (
            <Tr key={c.id}>
              <Td>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--info-text)', background: 'var(--info-bg)', padding: '2px 6px', borderRadius: 4 }}>
                  {c.licenca.tipo} — {c.licenca.orgao}
                </span>
              </Td>
              <Td muted>{c.licenca.empresa.razaoSocial}</Td>
              <Td bold>{c.descricao}</Td>
              <Td muted>{c.periodicidade ?? '—'}</Td>
              <Td>
                <span style={{ fontSize: 12, fontWeight: vencendo ? 700 : 400, color: vencendo ? '#dc2626' : 'var(--text-primary)' }}>
                  {fmt(c.prazo)}
                  {vencendo && dias !== null && <span style={{ fontSize: 10, marginLeft: 4 }}>({dias}d)</span>}
                </span>
              </Td>
              <Td muted>{c.responsavel ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <Link href={`/meio-ambiente/condicionantes/${c.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
