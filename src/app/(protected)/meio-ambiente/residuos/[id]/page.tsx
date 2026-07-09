import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ResiduoDetailTabs } from './residuo-detail-tabs'

export default async function ResiduoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const residuo = await prisma.controleResiduo.findUnique({
    where: { id },
    include: { empresa: true, unidade: true, coletor: true },
  })

  if (!residuo) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'CONTROLE_RESIDUO', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <ResiduoDetailTabs
      historico={historico.map(h => ({
        id: h.id,
        acao: h.acao,
        descricao: h.descricao,
        createdAt: h.createdAt.toISOString(),
        usuario: h.usuario?.name ?? null,
      }))}
      residuo={{
        id: residuo.id,
        descricao: residuo.descricao,
        tipoResiduo: residuo.tipoResiduo,
        classificacao: residuo.classificacao,
        codigoIBAMA: residuo.codigoIBAMA,
        classeRisco: residuo.classeRisco,
        origem: residuo.origem,
        setorGerador: residuo.setorGerador,
        quantidade: residuo.quantidade,
        unidadeMedida: residuo.unidadeMedida,
        peso: residuo.peso,
        formaArmazenamento: residuo.formaArmazenamento,
        dataGeracao: residuo.dataGeracao.toISOString(),
        dataColeta: residuo.dataColeta ? residuo.dataColeta.toISOString() : null,
        dataDestinacao: residuo.dataDestinacao ? residuo.dataDestinacao.toISOString() : null,
        destinacao: residuo.destinacao,
        empresaColetora: residuo.empresaColetora,
        responsavel: residuo.responsavel,
        situacao: residuo.situacao,
        mtr: residuo.mtr,
        certificadoDest: residuo.certificadoDest,
        observacao: residuo.observacao,
        empresa: residuo.empresa ? { razaoSocial: residuo.empresa.razaoSocial } : null,
        unidade: residuo.unidade ? { nome: residuo.unidade.nome, cidade: residuo.unidade.cidade, uf: residuo.unidade.uf } : null,
        coletor: residuo.coletor ? { razaoSocial: residuo.coletor.razaoSocial } : null,
      }}
    />
  )
}
