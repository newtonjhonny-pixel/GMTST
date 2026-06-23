import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

function diasRestantes(fim: Date) {
  return Math.ceil((new Date(fim).getTime() - Date.now()) / 86400000)
}

const COLS = [
  { key: 'empresa',  label: 'Empresa' },
  { key: 'unidade',  label: 'Unidade' },
  { key: 'mandato',  label: 'Mandato' },
  { key: 'membros',  label: 'Membros', width: '80px', align: 'center' as const },
  { key: 'reunioes', label: 'Reuniões', width: '80px', align: 'center' as const },
  { key: 'situacao', label: 'Situação', width: '120px', align: 'center' as const },
]

export default async function CipaaPage() {
  const cipaas = await prisma.cipaa.findMany({
    include: {
      empresa: true,
      unidade: true,
      membros: { where: { status: 'ATIVO' } },
      reunioes: true,
    },
    orderBy: { mandatoFim: 'desc' },
  })

  const ativas   = cipaas.filter(c => c.status === 'ATIVO').length
  const vencendo = cipaas.filter(c => {
    const d = diasRestantes(c.mandatoFim)
    return c.status === 'ATIVO' && d >= 0 && d <= 60
  }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            CIPAA — Comissão Interna de Prevenção de Acidentes
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {cipaas.length} CIPAA{cipaas.length !== 1 ? 's' : ''} cadastrada{cipaas.length !== 1 ? 's' : ''}
            {ativas   > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}> · {ativas} ativa{ativas !== 1 ? 's' : ''}</span>}
            {vencendo > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {vencendo} mandato{vencendo !== 1 ? 's' : ''} a vencer em 60d</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tst/cipaa/cursos" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Cursos NR-5
          </Link>
          <Link href="/tst/cipaa/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
            <Plus size={14} />Nova CIPAA
          </Link>
        </div>
      </div>

      <DataTable columns={COLS} rowCount={cipaas.length} empty={{ icon: '🛡️', message: 'Nenhuma CIPAA cadastrada' }}>
        {cipaas.map(c => {
          const dias = diasRestantes(c.mandatoFim)
          return (
            <Tr key={c.id}>
              <Td bold>{c.empresa.razaoSocial}</Td>
              <Td muted>{c.unidade.nome} — {c.unidade.cidade}/{c.unidade.uf}</Td>
              <Td muted>{fmt(c.mandatoInicio)} → {fmt(c.mandatoFim)}</Td>
              <Td align="center"><span style={{ fontWeight: 700 }}>{c.membros.length}</span></Td>
              <Td align="center"><span style={{ fontWeight: 700 }}>{c.reunioes.length}</span></Td>
              <Td align="center">
                {c.status !== 'ATIVO'
                  ? <Pill color="#64748b" bg="#f8fafc">Encerrada</Pill>
                  : dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencida</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{dias}d restantes</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">Ativa</Pill>
                }
              </Td>
            </Tr>
          )
        })}
      </DataTable>

      {cipaas.length > 0 && (
        <div className="mt-6 flex gap-3 flex-wrap">
          {cipaas.map(c => (
            <Link
              key={c.id}
              href={`/tst/cipaa/${c.id}/membros`}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {c.empresa.razaoSocial} — Membros ({c.membros.length})
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
