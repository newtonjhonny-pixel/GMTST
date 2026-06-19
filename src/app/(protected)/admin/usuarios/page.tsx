import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({ orderBy: { name: 'asc' } })

  const roleMap: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    GERENTE: 'Gerente',
    COORDENADOR: 'Coordenador',
    ANALISTA_TST: 'Analista TST',
    ANALISTA_MEIO_AMBIENTE: 'Analista Meio Ambiente',
    CONSULTA: 'Consulta',
  }

  const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
    ADMINISTRADOR: 'danger',
    GERENTE: 'warning',
    COORDENADOR: 'info',
    ANALISTA_TST: 'success',
    ANALISTA_MEIO_AMBIENTE: 'success',
    CONSULTA: 'secondary',
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Acesso"
        description="Gerenciamento de usuários e perfis"
        actions={
          <Link href="/admin/usuarios/novo" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[u.role]}>{roleMap[u.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.ativo ? 'success' : 'secondary'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
