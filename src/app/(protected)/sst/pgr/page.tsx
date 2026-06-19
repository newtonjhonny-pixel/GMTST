import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, History } from 'lucide-react'
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
  { key: 'versao',    label: 'Versão',    width: '80px' },
  { key: 'emissao',   label: 'Emissão',   width: '100px' },
  { key: 'revisao',   label: 'Próx. Revisão', width: '120px' },
  { key: 'resp',      label: 'Resp. Técnico' },
  { key: 'crea',      label: 'CREA',      width: '100px' },
  { key: 'status',    label: 'Status',    width: '100px' },
  { key: 'acoes',     label: '',          width: '60px' },
]

export default async function PgrPage() {
  const pgrs = await prisma.pGR.findMany({
    include: { empresa: true, unidade: true, _count: { select: { revisoes: true, inventariosRiscos: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const vencidos = pgrs.filter(p => p.status === 'VENCIDO').length
  const aVencer  = pgrs.filter(p => {
    const d = diasPara(p.dataRevisao)
    return d !== null && d >= 0 && d <= 30
  }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            PGR — Programa de Gerenciamento de Riscos
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {pgrs.length} documento{pgrs.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} revisão próxima</span>}
          </p>
        </div>
        <Link
          href="/sst/pgr/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo PGR
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={pgrs.length} empty={{ icon: '📋', message: 'Nenhum PGR cadastrado' }}>
        {pgrs.map(p => {
          const ss = STATUS_STYLE[p.status] ?? STATUS_STYLE.VIGENTE
          return (
            <Tr key={p.id}>
              <Td bold>{p.empresa.razaoSocial}</Td>
              <Td muted>{p.unidade.nome}</Td>
              <Td mono>{p.versao}</Td>
              <Td muted>{fmt(p.dataEmissao)}</Td>
              <Td>
                {p.dataRevisao ? (() => {
                  const dias = diasPara(p.dataRevisao)
                  if (dias !== null && dias < 0)   return <Pill color="#dc2626" bg="#fef2f2">Atrasado</Pill>
                  if (dias !== null && dias <= 30)  return <Pill color="#d97706" bg="#fffbeb">{fmt(p.dataRevisao)} ({dias}d)</Pill>
                  return <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmt(p.dataRevisao)}</span>
                })() : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </Td>
              <Td>{p.responsavelTecnico}</Td>
              <Td mono>{p.crea ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sst/pgr/${p.id}`}
                    className="text-[11px] font-semibold"
                    style={{ color: 'var(--brand-from)' }}
                  >
                    Ver
                  </Link>
                  {p._count.revisoes > 0 && (
                    <span title={`${p._count.revisoes} revisões`}>
                      <History size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                  )}
                </div>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
