import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LicencaDetailTabs } from './licenca-detail-tabs'

export default async function LicencaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const licenca = await prisma.licencaAmbiental.findUnique({
    where: { id },
    include: { empresa: true, unidade: true, itensCondicionantes: true },
  })

  if (!licenca) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'LICENCA_AMBIENTAL', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <LicencaDetailTabs
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
      licenca={{
        id: licenca.id,
        tipo: licenca.tipo,
        orgao: licenca.orgao,
        numero: licenca.numero,
        emissao: licenca.emissao ? licenca.emissao.toISOString() : null,
        vencimento: licenca.vencimento.toISOString(),
        responsavel: licenca.responsavel,
        condicionantes: licenca.condicionantes,
        status: licenca.status,
        empresa: { razaoSocial: licenca.empresa.razaoSocial },
        unidade: { nome: licenca.unidade.nome, cidade: licenca.unidade.cidade, uf: licenca.unidade.uf },
        qtdCondicionantesVinculadas: licenca.itensCondicionantes.length,
      }}
    />
  )
}
