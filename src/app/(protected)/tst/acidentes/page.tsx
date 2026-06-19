import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const TIPO_LABEL: Record<string, string> = {
  TIPICO: 'Típico', TRAJETO: 'Trajeto', DOENCA_OCUPACIONAL: 'Doença Ocupacional',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ABERTO:           { bg: '#fffbeb', text: '#d97706', label: 'Aberto' },
  EM_INVESTIGACAO:  { bg: '#eff6ff', text: '#2563eb', label: 'Em Investigação' },
  CONCLUIDO:        { bg: '#f0fdf4', text: '#16a34a', label: 'Concluído' },
}

const COLS = [
  { key: 'data', label: 'Data', width: '100px' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'local', label: 'Local' },
  { key: 'tipo', label: 'Tipo', width: '140px' },
  { key: 'cat', label: 'CAT', width: '60px' },
  { key: 'numCat', label: 'N° CAT', width: '90px' },
  { key: 'status', label: 'Status', width: '130px' },
]

export default async function AcidentesPage() {
  const acidentes = await prisma.acidente.findMany({
    include: { empresa: true },
    orderBy: { data: 'desc' },
  })

  const abertos = acidentes.filter(a => a.status === 'ABERTO').length
  const invest  = acidentes.filter(a => a.status === 'EM_INVESTIGACAO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Acidentes de Trabalho
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {acidentes.length} registro{acidentes.length !== 1 ? 's' : ''}
            {abertos > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {abertos} aberto{abertos !== 1 ? 's' : ''}</span>}
            {invest > 0  && <span style={{ color: '#2563eb', fontWeight: 600 }}> · {invest} em investigação</span>}
          </p>
        </div>
        <Link
          href="/tst/acidentes/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Registrar Acidente
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={acidentes.length} empty={{ icon: '⚠️', message: 'Nenhum acidente registrado' }}>
        {acidentes.map(a => {
          const ss = STATUS_STYLE[a.status] ?? STATUS_STYLE.ABERTO
          return (
            <Tr key={a.id}>
              <Td muted>{fmt(a.data)}</Td>
              <Td bold>{a.empresa.razaoSocial}</Td>
              <Td muted>{a.local}</Td>
              <Td>{TIPO_LABEL[a.tipologia] ?? a.tipologia}</Td>
              <Td>
                <Pill color={a.cat ? '#dc2626' : '#475569'} bg={a.cat ? '#fef2f2' : '#f1f5f9'}>
                  {a.cat ? 'Sim' : 'Não'}
                </Pill>
              </Td>
              <Td mono>{a.numeroCat ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
