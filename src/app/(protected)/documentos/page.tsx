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

function VencBadge({ d }: { d: Date | null }) {
  const dias = diasPara(d)
  if (dias === null) return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
  if (dias < 0)   return <Pill color="#dc2626" bg="#fef2f2">Vencido</Pill>
  if (dias <= 30) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const TIPO_LABEL: Record<string, string> = {
  PGR: 'PGR', PCMSO: 'PCMSO', LTCAT: 'LTCAT', PPP: 'PPP',
  LAUDO_INSALUBRIDADE: 'Laudo Insalubridade', LAUDO_PERICULOSIDADE: 'Laudo Periculosidade',
  LAUDO_ERGONOMICO: 'Laudo Ergonômico', LICENCA_AMBIENTAL: 'Licença Ambiental',
  CERTIDAO_NEGATIVA: 'Certidão Negativa', CTF_APP_IBAMA: 'CTF/APP IBAMA',
  AVCB: 'AVCB', ALVARA: 'Alvará', OUTRO: 'Outro',
}

const COLS = [
  { key: 'nome', label: 'Nome / Documento' },
  { key: 'tipo', label: 'Tipo', width: '160px' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'emissao', label: 'Emissão', width: '100px' },
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'resp', label: 'Responsável' },
]

export default async function DocumentosPage() {
  const documentos = await prisma.documentoLegal.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { vencimento: 'asc' },
  })

  const vencidos = documentos.filter(d => (diasPara(d.vencimento) ?? 0) < 0).length
  const aVencer  = documentos.filter(d => { const x = diasPara(d.vencimento); return x !== null && x >= 0 && x <= 30 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Documentos Legais
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
            {aVencer > 0  && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer</span>}
          </p>
        </div>
        <Link
          href="/documentos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Documento
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={documentos.length} empty={{ icon: '📁', message: 'Nenhum documento cadastrado' }}>
        {documentos.map(d => (
          <Tr key={d.id}>
            <Td bold>{d.nome}</Td>
            <Td>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}
              >
                {TIPO_LABEL[d.tipo] ?? d.tipo}
              </span>
            </Td>
            <Td muted>{d.empresa.razaoSocial}</Td>
            <Td muted>{d.unidade.nome}</Td>
            <Td muted>{fmt(d.emissao)}</Td>
            <Td><VencBadge d={d.vencimento} /></Td>
            <Td muted>{d.responsavel ?? '—'}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
