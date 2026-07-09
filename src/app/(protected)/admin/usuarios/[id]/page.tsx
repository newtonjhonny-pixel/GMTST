import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { UsuarioEditForm } from './usuario-edit-form'

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, perfis, empresas] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { perfil: true, empresa: true, unidade: true } }),
    prisma.perfil.findMany({ where: { ativo: true }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
    prisma.empresa.findMany({ select: { id: true, razaoSocial: true }, orderBy: { razaoSocial: 'asc' } }),
  ])

  if (!usuario) notFound()

  const unidadesIniciais = usuario.empresaId
    ? await prisma.unidade.findMany({
        where: { empresaId: usuario.empresaId },
        select: { id: true, nome: true, cidade: true, uf: true },
        orderBy: { nome: 'asc' },
      })
    : []

  return (
    <UsuarioEditForm
      perfis={perfis}
      empresas={empresas}
      unidadesIniciais={unidadesIniciais}
      usuario={{
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        ativo: usuario.ativo,
        perfilId: usuario.perfilId,
        empresaId: usuario.empresaId,
        unidadeId: usuario.unidadeId,
        perfilNome: usuario.perfil?.nome ?? null,
      }}
    />
  )
}
