import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

const roleMap: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  GERENTE: 'Gerente',
  COORDENADOR: 'Coordenador',
  ANALISTA_TST: 'Analista TST',
  ANALISTA_MEIO_AMBIENTE: 'Analista Meio Ambiente',
  CONSULTA: 'Consulta',
}

const COLS = [
  { key: 'nome',     label: 'Nome' },
  { key: 'email',    label: 'E-mail' },
  { key: 'perfil',   label: 'Perfil' },
  { key: 'empresa',  label: 'Empresa / Unidade' },
  { key: 'status',   label: 'Status',          width: '90px', align: 'center' as const },
  { key: 'criado',   label: 'Cadastrado em',   width: '150px' },
  { key: 'acoes',    label: '',                width: '50px' },
]

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({
    include: { perfil: true, empresa: true, unidade: true },
    orderBy: { name: 'asc' },
  })

  const ativos = usuarios.filter(u => u.ativo).length
  const semPerfil = usuarios.filter(u => !u.perfilId).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Usuários e Perfis
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} · {ativos} ativo{ativos !== 1 ? 's' : ''}
            {semPerfil > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {semPerfil} sem perfil definido</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/perfis" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Gerenciar Perfis
          </Link>
          <Link href="/admin/usuarios/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
            <Plus size={14} />Novo Usuário
          </Link>
        </div>
      </div>

      <DataTable columns={COLS} rowCount={usuarios.length} empty={{ icon: '👤', message: 'Nenhum usuário cadastrado' }}>
        {usuarios.map(u => (
          <Tr key={u.id}>
            <Td bold>{u.name}</Td>
            <Td muted>{u.email}</Td>
            <Td>
              {u.perfil
                ? <Pill color="#185FA5" bg="#E6F1FB">{u.perfil.nome}</Pill>
                : <Pill color="#d97706" bg="#fffbeb">{roleMap[u.role] ?? u.role} (legado)</Pill>}
            </Td>
            <Td muted>
              {u.empresa ? u.empresa.razaoSocial : '—'}{u.unidade ? ` · ${u.unidade.nome}` : ''}
            </Td>
            <Td align="center">
              <Pill color={u.ativo ? '#16a34a' : '#64748b'} bg={u.ativo ? '#f0fdf4' : '#f8fafc'}>
                {u.ativo ? 'Ativo' : 'Inativo'}
              </Pill>
            </Td>
            <Td muted>{formatDateTime(u.createdAt)}</Td>
            <Td>
              <Link href={`/admin/usuarios/${u.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Editar</Link>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
