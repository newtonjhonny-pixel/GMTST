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
  { key: 'empresa',   label: 'Empresa' },
  { key: 'unidade',   label: 'Unidade' },
  { key: 'resp',      label: 'Resp. Técnico' },
  { key: 'crea',      label: 'CREA',    width: '100px' },
  { key: 'art',       label: 'ART',     width: '100px' },
  { key: 'emissao',   label: 'Emissão', width: '100px' },
  { key: 'vigencia',  label: 'Vigência', width: '110px' },
  { key: 'agentes',   label: 'Agentes Nocivos' },
  { key: 'status',    label: 'Status',  width: '100px' },
  { key: 'acoes',     label: '',        width: '50px' },
]

export default async function LtcatPage() {
  const ltcats = await prisma.lTCAT.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { createdAt: 'desc' },
  })

  const vencidos = ltcats.filter(l => l.status === 'VENCIDO').length
  const aVencer  = ltcats.filter(l => {
    const d = diasPara(l.vigencia)
    return d !== null && d >= 0 && d <= 30
  }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            LTCAT — Laudo Técnico das Condições Ambientais do Trabalho
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {ltcats.length} laudo{ltcats.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link
          href="/sst/ltcat/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo LTCAT
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={ltcats.length} empty={{ icon: '📄', message: 'Nenhum LTCAT cadastrado' }}>
        {ltcats.map(l => {
          const ss = STATUS_STYLE[l.status] ?? STATUS_STYLE.VIGENTE
          const diasVig = diasPara(l.vigencia)
          return (
            <Tr key={l.id}>
              <Td bold>{l.empresa.razaoSocial}</Td>
              <Td muted>{l.unidade.nome}</Td>
              <Td>{l.responsavelTecnico}</Td>
              <Td mono>{l.crea ?? '—'}</Td>
              <Td mono>{l.art ?? '—'}</Td>
              <Td muted>{fmt(l.dataEmissao)}</Td>
              <Td>
                {l.vigencia ? (
                  diasVig !== null && diasVig < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                    : diasVig !== null && diasVig <= 30
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(l.vigencia)} ({diasVig}d)</Pill>
                      : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmt(l.vigencia)}</span>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {l.agentesNocivos.slice(0, 3).map(a => (
                    <Pill key={a} color="#7c3aed" bg="#f5f3ff">{a}</Pill>
                  ))}
                  {l.agentesNocivos.length > 3 && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{l.agentesNocivos.length - 3}</span>
                  )}
                  {l.agentesNocivos.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
                </div>
              </Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <Link
                  href={`/sst/ltcat/${l.id}`}
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
