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

const COLS = [
  { key: 'nome',      label: 'Razão Social' },
  { key: 'cnpj',      label: 'CNPJ',          width: '140px' },
  { key: 'residuos',  label: 'Tipos de Resíduos' },
  { key: 'licenca',   label: 'Licença Ambiental' },
  { key: 'validade',  label: 'Validade Licença', width: '130px' },
  { key: 'status',    label: 'Status',           width: '90px', align: 'center' as const },
]

export default async function ColetorasPage() {
  const coletoras = await prisma.empresaColetora.findMany({ orderBy: { razaoSocial: 'asc' } })

  const vencidas = coletoras.filter(c => (diasPara(c.validadeLicenca) ?? 1) < 0).length
  const aVencer  = coletoras.filter(c => { const d = diasPara(c.validadeLicenca); return d !== null && d >= 0 && d <= 60 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Empresas Coletoras / Destinadoras
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {coletoras.length} empresa{coletoras.length !== 1 ? 's' : ''} cadastrada{coletoras.length !== 1 ? 's' : ''}
            {vencidas > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidas} com licença vencida</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer em 60d</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/coletoras/nova" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Nova Coletora
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={coletoras.length} empty={{ icon: '🚛', message: 'Nenhuma empresa coletora cadastrada' }}>
        {coletoras.map(c => {
          const dias = diasPara(c.validadeLicenca)
          return (
            <Tr key={c.id}>
              <Td bold>{c.razaoSocial}</Td>
              <Td mono muted>{c.cnpj ?? '—'}</Td>
              <Td muted>
                <span style={{ display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.tiposResiduos.length > 0 ? c.tiposResiduos.join(', ') : '—'}
                </span>
              </Td>
              <Td muted>{c.licencaAmbiental ?? '—'}</Td>
              <Td>
                {dias === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencida ({fmt(c.validadeLicenca)})</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(c.validadeLicenca)} ({dias}d)</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">{fmt(c.validadeLicenca)}</Pill>
                }
              </Td>
              <Td align="center">
                <Pill color={c.status === 'ATIVO' ? '#16a34a' : '#64748b'} bg={c.status === 'ATIVO' ? '#f0fdf4' : '#f8fafc'}>
                  {c.status === 'ATIVO' ? 'Ativa' : 'Inativa'}
                </Pill>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
