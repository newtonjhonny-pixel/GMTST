import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { formatCPF } from '@/lib/utils'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const AGENTE_COLORS: Record<string, { bg: string; text: string }> = {
  RUIDO:     { bg: '#fef2f2', text: '#dc2626' },
  CALOR:     { bg: '#fff7ed', text: '#c2410c' },
  QUIMICO:   { bg: '#f5f3ff', text: '#7c3aed' },
  BIOLOGICO: { bg: '#f0fdf4', text: '#16a34a' },
}

const COLS = [
  { key: 'colaborador', label: 'Colaborador' },
  { key: 'cpf',         label: 'CPF',         width: '110px' },
  { key: 'empresa',     label: 'Empresa' },
  { key: 'unidade',     label: 'Unidade' },
  { key: 'funcao',      label: 'Função' },
  { key: 'emissao',     label: 'Emissão',     width: '100px' },
  { key: 'agentes',     label: 'Agentes Nocivos' },
  { key: 'resp',        label: 'Responsável' },
  { key: 'acoes',       label: '',            width: '60px' },
]

export default async function PppPage() {
  const ppps = await prisma.pPP.findMany({
    include: {
      colaborador: { include: { unidade: { include: { empresa: true } } } },
      empresa: true,
      unidade: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            PPP — Perfil Profissiográfico Previdenciário
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {ppps.length} PPP{ppps.length !== 1 ? 's' : ''} emitido{ppps.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/sst/ppp/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo PPP
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={ppps.length} empty={{ icon: '🪪', message: 'Nenhum PPP emitido' }}>
        {ppps.map(p => (
          <Tr key={p.id}>
            <Td bold>{p.colaborador.nome}</Td>
            <Td mono>{formatCPF(p.colaborador.cpf)}</Td>
            <Td muted>{p.empresa.razaoSocial}</Td>
            <Td muted>{p.unidade.nome}</Td>
            <Td>{p.colaborador.funcao}</Td>
            <Td muted>{fmt(p.dataEmissao)}</Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {p.agentesNocivos.slice(0, 3).map(a => {
                  const cs = AGENTE_COLORS[a] ?? { bg: '#f1f5f9', text: '#475569' }
                  return <Pill key={a} color={cs.text} bg={cs.bg}>{a}</Pill>
                })}
                {p.agentesNocivos.length > 3 && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{p.agentesNocivos.length - 3}</span>
                )}
                {p.agentesNocivos.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </div>
            </Td>
            <Td muted>{p.responsavel ?? '—'}</Td>
            <Td>
              <button
                className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-1"
                style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}
                title="Exportar PDF"
              >
                <Download size={11} />
                PDF
              </button>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
