import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const CARGO_LABEL: Record<string, string> = {
  PRESIDENTE: 'Presidente',
  VICE_PRESIDENTE: 'Vice-Presidente',
  SECRETARIO: 'Secretário(a)',
  MEMBRO_EFETIVO: 'Membro Efetivo',
  MEMBRO_SUPLENTE: 'Membro Suplente',
}

const REPR_COLOR: Record<string, { color: string; bg: string }> = {
  EMPREGADO:  { color: '#185FA5', bg: '#E6F1FB' },
  EMPREGADOR: { color: '#7c3aed', bg: '#f5f3ff' },
}

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const COLS = [
  { key: 'cargo',   label: 'Cargo' },
  { key: 'nome',    label: 'Colaborador' },
  { key: 'repr',    label: 'Representação',   width: '130px', align: 'center' as const },
  { key: 'setor',   label: 'Setor / Função' },
  { key: 'posse',   label: 'Data de Posse',   width: '120px' },
  { key: 'status',  label: 'Status',          width: '90px', align: 'center' as const },
]

export default async function MembrosCipaaPage({ params }: { params: Promise<{ cipaId: string }> }) {
  const { cipaId } = await params
  const cipa = await prisma.cipaa.findUnique({
    where: { id: cipaId },
    include: {
      empresa: true,
      unidade: true,
      membros: {
        include: { colaborador: true },
        orderBy: { cargo: 'asc' },
      },
    },
  })
  if (!cipa) notFound()

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/tst/cipaa" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={14}/></Link>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cipa.empresa.razaoSocial} — {cipa.unidade.nome}</p>
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Membros da CIPAA
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Mandato: {new Date(cipa.mandatoInicio).toLocaleDateString('pt-BR')} → {new Date(cipa.mandatoFim).toLocaleDateString('pt-BR')}
            {cipa.numeroEdital && <span> · Edital {cipa.numeroEdital}</span>}
            <span style={{ fontWeight: 600, marginLeft: 8 }}>{cipa.membros.length} membro{cipa.membros.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tst/cipaa/${cipaId}/reunioes`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Ver Reuniões
          </Link>
          <Link href={`/tst/cipaa/${cipaId}/membros/novo`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
            <Plus size={14} />Adicionar Membro
          </Link>
        </div>
      </div>

      <DataTable columns={COLS} rowCount={cipa.membros.length} empty={{ icon: '👥', message: 'Nenhum membro cadastrado nesta CIPAA' }}>
        {cipa.membros.map(m => (
          <Tr key={m.id}>
            <Td bold>{CARGO_LABEL[m.cargo] ?? m.cargo}</Td>
            <Td>{m.colaborador.nome}</Td>
            <Td align="center">
              <Pill color={REPR_COLOR[m.representacao]?.color ?? '#64748b'} bg={REPR_COLOR[m.representacao]?.bg ?? '#f8fafc'}>
                {m.representacao === 'EMPREGADO' ? 'Empregado' : 'Empregador'}
              </Pill>
            </Td>
            <Td muted>{m.colaborador.setor} / {m.colaborador.funcao}</Td>
            <Td muted>{fmt(m.dataPosse)}</Td>
            <Td align="center">
              <Pill color={m.status === 'ATIVO' ? '#16a34a' : '#64748b'} bg={m.status === 'ATIVO' ? '#f0fdf4' : '#f8fafc'}>
                {m.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
              </Pill>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
