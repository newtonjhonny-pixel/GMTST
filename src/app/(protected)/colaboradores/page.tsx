import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { formatCPF } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVO:    { bg: '#f0fdf4', text: '#16a34a', label: 'Ativo' },
  INATIVO:  { bg: '#f1f5f9', text: '#475569', label: 'Inativo' },
  DEMITIDO: { bg: '#fef2f2', text: '#dc2626', label: 'Demitido' },
  AFASTADO: { bg: '#fffbeb', text: '#d97706', label: 'Afastado' },
}

const COLS = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF', width: '110px' },
  { key: 'matricula', label: 'Matrícula', width: '90px' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'setor', label: 'Setor' },
  { key: 'funcao', label: 'Função' },
  { key: 'admissao', label: 'Admissão', width: '100px' },
  { key: 'status', label: 'Status', width: '90px' },
]

export default async function ColaboradoresPage() {
  const colaboradores = await prisma.colaborador.findMany({
    include: { unidade: { include: { empresa: true } } },
    orderBy: { nome: 'asc' },
  })

  const ativos = colaboradores.filter(c => c.status === 'ATIVO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Colaboradores
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {colaboradores.length} cadastrado{colaboradores.length !== 1 ? 's' : ''}
            {ativos > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}> · {ativos} ativo{ativos !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/colaboradores/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Colaborador
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={colaboradores.length} empty={{ icon: '👤', message: 'Nenhum colaborador cadastrado' }}>
        {colaboradores.map(c => {
          const ss = STATUS_STYLE[c.status] ?? STATUS_STYLE.INATIVO
          return (
            <Tr key={c.id}>
              <Td bold>{c.nome}</Td>
              <Td mono>{formatCPF(c.cpf)}</Td>
              <Td mono>{c.matricula ?? '—'}</Td>
              <Td muted>{c.unidade.empresa.razaoSocial}</Td>
              <Td>{c.setor}</Td>
              <Td>{c.funcao}</Td>
              <Td muted>{fmt(c.admissao)}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
