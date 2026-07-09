import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const COLS = [
  { key: 'nome',        label: 'Perfil' },
  { key: 'descricao',   label: 'Descrição' },
  { key: 'permissoes',  label: 'Permissões',  width: '110px', align: 'center' as const },
  { key: 'usuarios',    label: 'Usuários',    width: '90px', align: 'center' as const },
  { key: 'status',      label: 'Status',      width: '90px', align: 'center' as const },
  { key: 'acoes',       label: '',            width: '50px' },
]

export default async function PerfisPage() {
  const perfis = await prisma.perfil.findMany({
    include: { _count: { select: { usuarios: true } } },
    orderBy: { nome: 'asc' },
  })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Perfis de Acesso
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {perfis.length} {perfis.length !== 1 ? 'perfis cadastrados' : 'perfil cadastrado'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/usuarios" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Ver Usuários
          </Link>
          <Link href="/admin/perfis/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
            <Plus size={14} />Novo Perfil
          </Link>
        </div>
      </div>

      <DataTable columns={COLS} rowCount={perfis.length} empty={{ icon: '🛡️', message: 'Nenhum perfil cadastrado' }}>
        {perfis.map(p => (
          <Tr key={p.id}>
            <Td bold>{p.nome}</Td>
            <Td muted>{p.descricao ?? '—'}</Td>
            <Td align="center">{p.permissoes.length}</Td>
            <Td align="center">{p._count.usuarios}</Td>
            <Td align="center">
              <Pill color={p.ativo ? '#16a34a' : '#64748b'} bg={p.ativo ? '#f0fdf4' : '#f8fafc'}>
                {p.ativo ? 'Ativo' : 'Inativo'}
              </Pill>
            </Td>
            <Td>
              <Link href={`/admin/perfis/${p.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Editar</Link>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
