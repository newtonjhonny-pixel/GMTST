import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const TIPO_RISCO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  FISICO:      { bg: '#eff6ff', text: '#2563eb', label: 'Físico' },
  QUIMICO:     { bg: '#f5f3ff', text: '#7c3aed', label: 'Químico' },
  BIOLOGICO:   { bg: '#f0fdf4', text: '#16a34a', label: 'Biológico' },
  ERGONOMICO:  { bg: '#fff7ed', text: '#c2410c', label: 'Ergonômico' },
  ACIDENTE:    { bg: '#fef2f2', text: '#dc2626', label: 'Acidente' },
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  IDENTIFICADO: { bg: '#fef2f2', text: '#dc2626', label: 'Identificado' },
  AVALIADO:     { bg: '#fffbeb', text: '#d97706', label: 'Avaliado' },
  CONTROLADO:   { bg: '#f0fdf4', text: '#16a34a', label: 'Controlado' },
}

const COLS = [
  { key: 'empresa',   label: 'Empresa' },
  { key: 'unidade',   label: 'Unidade' },
  { key: 'ghe',       label: 'GHE' },
  { key: 'atividade', label: 'Atividade' },
  { key: 'agente',    label: 'Agente' },
  { key: 'tipo',      label: 'Tipo',   width: '100px' },
  { key: 'nivel',     label: 'Nível de Ação', width: '110px' },
  { key: 'epi',       label: 'EPI Requerido' },
  { key: 'resp',      label: 'Responsável' },
  { key: 'status',    label: 'Status', width: '110px' },
]

export default async function InventarioRiscosPage() {
  const itens = await prisma.inventarioRisco.findMany({
    include: { empresa: true, unidade: true, pgr: { select: { versao: true } } },
    orderBy: [{ tipoRisco: 'asc' }, { createdAt: 'desc' }],
  })

  const identificados = itens.filter(i => i.status === 'IDENTIFICADO').length
  const avaliados     = itens.filter(i => i.status === 'AVALIADO').length
  const controlados   = itens.filter(i => i.status === 'CONTROLADO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Inventário de Riscos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {itens.length} item{itens.length !== 1 ? 's' : ''}
            {identificados > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {identificados} identificado{identificados !== 1 ? 's' : ''}</span>}
            {avaliados > 0     && <span style={{ color: '#d97706', fontWeight: 600 }}> · {avaliados} avaliado{avaliados !== 1 ? 's' : ''}</span>}
            {controlados > 0   && <span style={{ color: '#16a34a', fontWeight: 600 }}> · {controlados} controlado{controlados !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/sst/inventario-riscos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Item
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={itens.length} empty={{ icon: '⚠️', message: 'Nenhum risco identificado' }}>
        {itens.map(item => {
          const tr = TIPO_RISCO_STYLE[item.tipoRisco] ?? TIPO_RISCO_STYLE.FISICO
          const ss = STATUS_STYLE[item.status] ?? STATUS_STYLE.IDENTIFICADO
          return (
            <Tr key={item.id}>
              <Td bold>{item.empresa.razaoSocial}</Td>
              <Td muted>{item.unidade.nome}</Td>
              <Td>
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-secondary)' }}>
                  {item.ghe}
                </span>
              </Td>
              <Td>{item.atividade}</Td>
              <Td bold>{item.agente}</Td>
              <Td><Pill color={tr.text} bg={tr.bg}>{tr.label}</Pill></Td>
              <Td muted>{item.nivelAcao ?? '—'}</Td>
              <Td muted>{item.epi ?? '—'}</Td>
              <Td muted>{item.responsavel ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
