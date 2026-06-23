import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
  ABERTA:    { label: 'Aberta',    color: '#185FA5', bg: '#E6F1FB' },
  APROVADA:  { label: 'Aprovada',  color: '#16a34a', bg: '#f0fdf4' },
  REPROVADA: { label: 'Reprovada', color: '#dc2626', bg: '#fef2f2' },
  COMPRADA:  { label: 'Comprada',  color: '#7c3aed', bg: '#f5f3ff' },
  CANCELADA: { label: 'Cancelada', color: '#64748b', bg: '#f8fafc' },
}

const COLS = [
  { key: 'data',     label: 'Data',          width: '110px' },
  { key: 'empresa',  label: 'Empresa' },
  { key: 'epi',      label: 'EPI' },
  { key: 'qtd',      label: 'Qtd.',          width: '70px', align: 'center' as const },
  { key: 'solicit',  label: 'Solicitante' },
  { key: 'status',   label: 'Status',        width: '100px', align: 'center' as const },
]

export default async function SolicitacoesCompraPage() {
  const solicitacoes = await prisma.solicitacaoCompraEPI.findMany({
    include: { empresa: true, epi: true },
    orderBy: { dataSolicitacao: 'desc' },
  })
  const abertas   = solicitacoes.filter(s => s.status === 'ABERTA').length
  const aprovadas = solicitacoes.filter(s => s.status === 'APROVADA').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Solicitações de Compra — EPI
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {solicitacoes.length} solicitaç{solicitacoes.length !== 1 ? 'ões' : 'ão'}
            {abertas   > 0 && <span style={{ color: '#185FA5', fontWeight: 600 }}> · {abertas} aberta{abertas !== 1 ? 's' : ''}</span>}
            {aprovadas > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}> · {aprovadas} aprovada{aprovadas !== 1 ? 's' : ''} aguardando compra</span>}
          </p>
        </div>
        <Link href="/tst/solicitacoes-compra/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Nova Solicitação
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={solicitacoes.length} empty={{ icon: '🛒', message: 'Nenhuma solicitação de compra cadastrada' }}>
        {solicitacoes.map(s => (
          <Tr key={s.id}>
            <Td muted>{fmt(s.dataSolicitacao)}</Td>
            <Td bold>{s.empresa.razaoSocial}</Td>
            <Td>{s.epi?.nome ?? s.descricaoEPI}</Td>
            <Td align="center"><span style={{ fontWeight: 700 }}>{s.quantidade}</span></Td>
            <Td muted>{s.solicitante ?? '—'}</Td>
            <Td align="center">
              <Pill color={STATUS_INFO[s.status]?.color ?? '#64748b'} bg={STATUS_INFO[s.status]?.bg ?? '#f8fafc'}>
                {STATUS_INFO[s.status]?.label ?? s.status}
              </Pill>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
