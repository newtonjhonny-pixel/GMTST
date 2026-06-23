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
  { key: 'numero',    label: 'Nº Certificado',  width: '130px' },
  { key: 'empresa',   label: 'Empresa Geradora' },
  { key: 'coletor',   label: 'Coletora / Destinadora' },
  { key: 'emissao',   label: 'Emissão',          width: '110px' },
  { key: 'residuos',  label: 'Resíduos' },
  { key: 'qtd',       label: 'Quantidade',       width: '110px', align: 'center' as const },
  { key: 'validade',  label: 'Validade' },
]

export default async function CertificadosDestinacaoPage() {
  const certs = await prisma.certificadoDestinacao.findMany({
    include: { empresa: true, coletor: true },
    orderBy: { dataEmissao: 'desc' },
  })

  const vencidos = certs.filter(c => (diasPara(c.dataVencimento) ?? 1) < 0).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Certificados de Destinação Final
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {certs.length} certificado{certs.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/meio-ambiente/certificados-destinacao/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Certificado
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={certs.length} empty={{ icon: '📄', message: 'Nenhum certificado de destinação cadastrado' }}>
        {certs.map(c => {
          const dias = diasPara(c.dataVencimento)
          return (
            <Tr key={c.id}>
              <Td mono bold>{c.numero ?? '—'}</Td>
              <Td>{c.empresa.razaoSocial}</Td>
              <Td muted>{c.coletor.razaoSocial}</Td>
              <Td muted>{fmt(c.dataEmissao)}</Td>
              <Td muted>
                <span style={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.tiposResiduos.join(', ') || '—'}
                </span>
              </Td>
              <Td align="center">
                {c.quantidadeTotal != null
                  ? <span style={{ fontWeight: 700 }}>{c.quantidadeTotal} {c.unidadeMedida ?? ''}</span>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>
                }
              </Td>
              <Td>
                {dias === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : dias < 0
                    ? <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
                    : dias <= 60
                      ? <Pill color="#d97706" bg="#fffbeb">{fmt(c.dataVencimento)} ({dias}d)</Pill>
                      : <Pill color="#16a34a" bg="#f0fdf4">{fmt(c.dataVencimento)}</Pill>
                }
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
