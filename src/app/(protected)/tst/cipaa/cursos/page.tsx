import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const COLS = [
  { key: 'data',       label: 'Data do Curso',   width: '120px' },
  { key: 'colaborador',label: 'Cipeiro' },
  { key: 'empresa',    label: 'Empresa' },
  { key: 'carga',      label: 'Carga (h)',        width: '80px', align: 'center' as const },
  { key: 'instrutor',  label: 'Instrutor / Inst.' },
  { key: 'validade',   label: 'Validade' },
]

export default async function CursosCipaaPage() {
  const cursos = await prisma.cursoCipaa.findMany({
    include: { empresa: true, colaborador: true },
    orderBy: { dataCurso: 'desc' },
  })

  const vencidos = cursos.filter(c => (diasPara(c.validade) ?? 1) < 0).length
  const aVencer  = cursos.filter(c => { const d = diasPara(c.validade); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/tst/cipaa" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={14}/></Link>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>CIPAA</span>
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Cursos NR-5 — Cipeiros
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {cursos.length} registro{cursos.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer em 60d</span>}
          </p>
        </div>
        <Link href="/tst/cipaa/cursos/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Curso NR-5
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={cursos.length} empty={{ icon: '🎓', message: 'Nenhum curso NR-5 registrado' }}>
        {cursos.map(c => {
          const dias = diasPara(c.validade)
          return (
            <Tr key={c.id}>
              <Td muted>{fmt(c.dataCurso)}</Td>
              <Td bold>{c.colaborador.nome}</Td>
              <Td muted>{c.empresa.razaoSocial}</Td>
              <Td align="center"><span style={{ fontWeight: 700 }}>{c.cargaHoraria ?? '—'}</span></Td>
              <Td muted>{c.instrutor ?? '—'}{c.instituicao ? ` / ${c.instituicao}` : ''}</Td>
              <Td>
                {dias === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Sem validade</span>
                  : dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencida ({fmt(c.validade)})</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(c.validade)} ({dias}d)</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">{fmt(c.validade)}</Pill>
                }
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
