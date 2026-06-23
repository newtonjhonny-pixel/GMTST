import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const TIPO_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  DSSMA:       { bg: '#EAF3DE', text: '#27500A', label: 'DSSMA' },
  PALESTRA:    { bg: '#E6F1FB', text: '#0C447C', label: 'Palestra' },
  INFORMATIVO: { bg: '#FAEEDA', text: '#633806', label: 'Informativo' },
  CAMPANHA:    { bg: '#FBEAF0', text: '#4B1528', label: 'Campanha' },
  REUNIAO_SST: { bg: '#EEEDFE', text: '#26215C', label: 'Reunião SST' },
}

const COLS = [
  { key: 'data',         label: 'Data',         width: '110px' },
  { key: 'tipo',         label: 'Tipo',         width: '120px' },
  { key: 'titulo',       label: 'Título' },
  { key: 'empresa',      label: 'Empresa' },
  { key: 'local',        label: 'Local' },
  { key: 'responsavel',  label: 'Responsável' },
  { key: 'participantes',label: 'Part.',         width: '70px', align: 'center' as const },
  { key: 'duracao',      label: 'Duração',       width: '80px', align: 'center' as const },
]

export default async function ComunicacoesPage() {
  const items = await prisma.comunicacaoSST.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { data: 'desc' },
  })
  const dssma     = items.filter(i => i.tipo === 'DSSMA').length
  const palestras = items.filter(i => i.tipo === 'PALESTRA').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            DSSMA · Palestras · Informativos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {items.length} registro{items.length !== 1 ? 's' : ''}
            {dssma > 0     && <span style={{ color: '#27500A', fontWeight: 600 }}> · {dssma} DSSMA</span>}
            {palestras > 0 && <span style={{ color: '#0C447C', fontWeight: 600 }}> · {palestras} palestra{palestras !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/tst/comunicacoes/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Registro
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={items.length} empty={{ icon: '📢', message: 'Nenhum registro de comunicação SST' }}>
        {items.map(i => {
          const ts = TIPO_STYLE[i.tipo] ?? TIPO_STYLE.INFORMATIVO
          return (
            <Tr key={i.id}>
              <Td muted>{fmt(i.data)}</Td>
              <Td><Pill color={ts.text} bg={ts.bg}>{ts.label}</Pill></Td>
              <Td bold>{i.titulo}</Td>
              <Td muted>{i.empresa.razaoSocial}</Td>
              <Td muted>{i.local ?? '—'}</Td>
              <Td muted>{i.responsavel ?? '—'}</Td>
              <Td align="center">{i.participantes ?? '—'}</Td>
              <Td align="center">{i.duracao ? `${i.duracao}min` : '—'}</Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
