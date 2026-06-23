import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVO:     { bg: '#f0fdf4', text: '#16a34a', label: 'Ativa' },
  INATIVO:   { bg: '#fffbeb', text: '#d97706', label: 'Inativa' },
  ARQUIVADO: { bg: '#f8fafc', text: '#64748b', label: 'Arquivada' },
}

const COLS = [
  { key: 'numero',      label: 'Nº OS',       width: '90px' },
  { key: 'empresa',     label: 'Empresa' },
  { key: 'colaborador', label: 'Colaborador' },
  { key: 'funcao',      label: 'Função' },
  { key: 'emissao',     label: 'Emissão',     width: '110px' },
  { key: 'assinado',    label: 'Assinado',    width: '90px', align: 'center' as const },
  { key: 'status',      label: 'Status',      width: '100px' },
]

export default async function OrdensServicoPage() {
  const ordens = await prisma.ordemServico.findMany({
    include: { empresa: true, unidade: true, colaborador: true },
    orderBy: { dataEmissao: 'desc' },
  })

  const naoAssinadas = ordens.filter(o => !o.assinado && o.status === 'ATIVO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Ordens de Serviço — NR-1
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {ordens.length} ordem{ordens.length !== 1 ? 's' : ''}
            {naoAssinadas > 0 && (
              <span style={{ color: '#d97706', fontWeight: 600 }}> · {naoAssinadas} pendente{naoAssinadas !== 1 ? 's' : ''} de assinatura</span>
            )}
          </p>
        </div>
        <Link
          href="/tst/ordens-servico/nova"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Nova OS
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={ordens.length} empty={{ icon: '📋', message: 'Nenhuma Ordem de Serviço cadastrada' }}>
        {ordens.map(o => {
          const ss = STATUS_STYLE[o.status] ?? STATUS_STYLE.ATIVO
          return (
            <Tr key={o.id}>
              <Td mono bold>{o.numero}</Td>
              <Td bold>{o.empresa.razaoSocial}</Td>
              <Td>{o.colaborador?.nome ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</Td>
              <Td muted>{o.funcao ?? o.colaborador?.funcao ?? '—'}</Td>
              <Td muted>{fmt(o.dataEmissao)}</Td>
              <Td align="center">
                <Pill color={o.assinado ? '#16a34a' : '#d97706'} bg={o.assinado ? '#f0fdf4' : '#fffbeb'}>
                  {o.assinado ? 'Sim' : 'Não'}
                </Pill>
              </Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
