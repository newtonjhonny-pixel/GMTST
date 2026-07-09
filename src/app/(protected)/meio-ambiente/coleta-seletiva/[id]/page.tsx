import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ColetaDetailTabs } from './coleta-detail-tabs'

export default async function ColetaSeletivaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reg = await prisma.coletaSeletiva.findUnique({
    where: { id },
    include: { empresa: true, unidade: true, coletor: true },
  })

  if (!reg) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'COLETA_SELETIVA', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <ColetaDetailTabs
      historico={historico.map(h => ({
        id: h.id,
        acao: h.acao,
        descricao: h.descricao,
        createdAt: h.createdAt.toISOString(),
        usuario: h.usuario?.name ?? null,
      }))}
      reg={{
        id: reg.id,
        local: reg.local,
        responsavel: reg.responsavel,
        frequencia: reg.frequencia,
        data: reg.data.toISOString(),
        material: reg.material,
        quantidade: reg.quantidade,
        peso: reg.peso,
        unidadeMedida: reg.unidadeMedida,
        destinacao: reg.destinacao,
        observacao: reg.observacao,
        empresa: { razaoSocial: reg.empresa.razaoSocial },
        unidade: { nome: reg.unidade.nome, cidade: reg.unidade.cidade, uf: reg.unidade.uf },
        coletor: reg.coletor ? { razaoSocial: reg.coletor.razaoSocial } : null,
      }}
    />
  )
}
