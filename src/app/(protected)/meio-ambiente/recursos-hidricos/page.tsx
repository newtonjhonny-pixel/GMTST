import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const TIPO_INFO: Record<string, { label: string; color: string; bg: string }> = {
  OUTORGA_CAPTACAO:    { label: 'Outorga Captação',   color: '#185FA5', bg: '#E6F1FB' },
  OUTORGA_LANCAMENTO:  { label: 'Outorga Lançamento', color: '#7c3aed', bg: '#f5f3ff' },
  POCO_ARTESIANO:      { label: 'Poço Artesiano',     color: '#0891b2', bg: '#ecfeff' },
  EFLUENTE_TRATADO:    { label: 'Efluente Tratado',   color: '#16a34a', bg: '#f0fdf4' },
  AGUA_REUSO:          { label: 'Água de Reúso',      color: '#d97706', bg: '#fffbeb' },
}

const COLS = [
  { key: 'tipo',      label: 'Tipo',           width: '160px' },
  { key: 'empresa',   label: 'Empresa' },
  { key: 'unidade',   label: 'Unidade' },
  { key: 'outorga',   label: 'Nº Outorga' },
  { key: 'orgao',     label: 'Órgão Outorgante' },
  { key: 'vazao',     label: 'Vazão',          width: '100px', align: 'center' as const },
  { key: 'vencimento',label: 'Vencimento' },
  { key: 'acoes',     label: '', width: '50px' },
]

export default async function RecursosHidricosPage() {
  const recursos = await prisma.recursoHidrico.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })

  const vencidos = recursos.filter(r => (diasPara(r.vencimento) ?? 1) < 0).length
  const aVencer  = recursos.filter(r => { const d = diasPara(r.vencimento); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Recursos Hídricos — Outorgas e Monitoramento
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {recursos.length} registro{recursos.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer em 60d</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/recursos-hidricos/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Registro
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={recursos.length} empty={{ icon: '💧', message: 'Nenhum recurso hídrico cadastrado' }}>
        {recursos.map(r => {
          const dias = diasPara(r.vencimento)
          const ti = TIPO_INFO[r.tipo]
          return (
            <Tr key={r.id}>
              <Td><Pill color={ti?.color ?? '#64748b'} bg={ti?.bg ?? '#f8fafc'}>{ti?.label ?? r.tipo}</Pill></Td>
              <Td bold>{r.empresa.razaoSocial}</Td>
              <Td muted>{r.unidade.nome} — {r.unidade.cidade}/{r.unidade.uf}</Td>
              <Td mono muted>{r.numeroOutorga ?? '—'}</Td>
              <Td muted>{r.orgaoOtorgante ?? '—'}</Td>
              <Td align="center">
                {r.vazaoAutorizada != null
                  ? <span style={{ fontWeight: 700 }}>{r.vazaoAutorizada} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{r.unidadeMedida ?? ''}</span></span>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>
                }
              </Td>
              <Td>
                {r.vencimento === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : dias !== null && dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencida ({fmt(r.vencimento)})</Pill>
                    : dias !== null && dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(r.vencimento)} ({dias}d)</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">{fmt(r.vencimento)}</Pill>
                }
              </Td>
              <Td>
                <Link href={`/meio-ambiente/recursos-hidricos/${r.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
