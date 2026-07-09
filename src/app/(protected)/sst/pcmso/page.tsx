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
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Vencer' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivado' },
}

const COLS = [
  { key: 'empresa',  label: 'Empresa' },
  { key: 'unidade',  label: 'Unidade' },
  { key: 'medico',   label: 'Médico Responsável' },
  { key: 'crm',      label: 'CRM',     width: '90px' },
  { key: 'clinica',  label: 'Clínica' },
  { key: 'inicio',   label: 'Vigência Inicial', width: '120px' },
  { key: 'fim',      label: 'Vigência Final',   width: '120px' },
  { key: 'status',   label: 'Status',  width: '100px' },
  { key: 'acoes',    label: '',        width: '50px' },
]

export default async function PcmsoPage() {
  const pcmsos = await prisma.pCMSO.findMany({
    include: { empresa: true, unidade: true, _count: { select: { examesPrevistos: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const vencidos = pcmsos.filter(p => p.status === 'VENCIDO').length
  const aVencer  = pcmsos.filter(p => {
    const d = diasPara(p.vigenciaFinal)
    return d !== null && d >= 0 && d <= 30
  }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            PCMSO — Programa de Controle Médico de Saúde Ocupacional
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {pcmsos.length} documento{pcmsos.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link
          href="/sst/pcmso/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo PCMSO
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={pcmsos.length} empty={{ icon: '🩺', message: 'Nenhum PCMSO cadastrado' }}>
        {pcmsos.map(p => {
          const ss = STATUS_STYLE[p.status] ?? STATUS_STYLE.VIGENTE
          const diasFim = diasPara(p.vigenciaFinal)
          return (
            <Tr key={p.id}>
              <Td bold>{p.empresa.razaoSocial}</Td>
              <Td muted>{p.unidade.nome}</Td>
              <Td>{p.medicoResponsavel}</Td>
              <Td mono>{p.crm ?? '—'}</Td>
              <Td muted>{p.clinica ?? '—'}</Td>
              <Td muted>{fmt(p.vigenciaInicial)}</Td>
              <Td>
                {p.vigenciaFinal ? (
                  diasFim !== null && diasFim < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencida</Pill>
                    : diasFim !== null && diasFim <= 30
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(p.vigenciaFinal)} ({diasFim}d)</Pill>
                      : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmt(p.vigenciaFinal)}</span>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <Link
                  href={`/sst/pcmso/${p.id}`}
                  className="text-[11px] font-semibold"
                  style={{ color: 'var(--brand-from)' }}
                >
                  Ver
                </Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
