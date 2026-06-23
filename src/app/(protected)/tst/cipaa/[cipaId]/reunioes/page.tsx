import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const COLS = [
  { key: 'data',     label: 'Data',      width: '110px' },
  { key: 'tipo',     label: 'Tipo',      width: '130px' },
  { key: 'local',    label: 'Local' },
  { key: 'pauta',    label: 'Pauta' },
  { key: 'presentes',label: 'Presentes', width: '80px', align: 'center' as const },
  { key: 'ata',      label: 'Ata',       width: '80px', align: 'center' as const },
]

export default async function ReunioesCipaaPage({ params }: { params: Promise<{ cipaId: string }> }) {
  const { cipaId } = await params
  const cipa = await prisma.cipaa.findUnique({
    where: { id: cipaId },
    include: {
      empresa: true,
      unidade: true,
      reunioes: { orderBy: { data: 'desc' } },
    },
  })
  if (!cipa) notFound()

  const comAta    = cipa.reunioes.filter(r => r.ata && r.ata.length > 0).length
  const aprovadas = cipa.reunioes.filter(r => r.aprovada).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/tst/cipaa/${cipaId}/membros`} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={14}/></Link>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cipa.empresa.razaoSocial} — {cipa.unidade.nome}</p>
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Reuniões da CIPAA
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {cipa.reunioes.length} reunião{cipa.reunioes.length !== 1 ? 'ões' : ''}
            {comAta > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}> · {comAta} com ata registrada</span>}
            {aprovadas > 0 && <span style={{ color: '#185FA5', fontWeight: 600 }}> · {aprovadas} aprovada{aprovadas !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href={`/tst/cipaa/${cipaId}/reunioes/nova`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Nova Reunião
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={cipa.reunioes.length} empty={{ icon: '📋', message: 'Nenhuma reunião registrada' }}>
        {cipa.reunioes.map(r => (
          <Tr key={r.id}>
            <Td muted>{fmt(r.data)}</Td>
            <Td>
              <Pill
                color={r.tipo === 'ORDINARIA' ? '#185FA5' : '#7c3aed'}
                bg={r.tipo === 'ORDINARIA' ? '#E6F1FB' : '#f5f3ff'}
              >
                {r.tipo === 'ORDINARIA' ? 'Ordinária' : 'Extraordinária'}
              </Pill>
            </Td>
            <Td muted>{r.local ?? '—'}</Td>
            <Td muted>
              <span style={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.pauta ?? '—'}
              </span>
            </Td>
            <Td align="center"><span style={{ fontWeight: 700 }}>{r.presentes.length}</span></Td>
            <Td align="center">
              {r.ata && r.ata.length > 0
                ? <Pill color="#16a34a" bg="#f0fdf4">Sim</Pill>
                : <Pill color="#d97706" bg="#fffbeb">Pendente</Pill>
              }
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
