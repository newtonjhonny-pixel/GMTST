import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PerfilForm } from '../perfil-form'

export default async function EditarPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const perfil = await prisma.perfil.findUnique({
    where: { id },
    include: { _count: { select: { usuarios: true } } },
  })

  if (!perfil) notFound()

  return (
    <PerfilForm
      perfil={{
        id: perfil.id,
        nome: perfil.nome,
        descricao: perfil.descricao,
        permissoes: perfil.permissoes,
        ativo: perfil.ativo,
        totalUsuarios: perfil._count.usuarios,
      }}
    />
  )
}
