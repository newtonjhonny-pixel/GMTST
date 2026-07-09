import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CertificadoDetailTabs } from './certificado-detail-tabs'

export default async function CertificadoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cert = await prisma.certificadoDestinacao.findUnique({
    where: { id },
    include: { empresa: true, unidade: true, coletor: true },
  })

  if (!cert) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'CERTIFICADO_DESTINACAO', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <CertificadoDetailTabs
      historico={historico.map(h => ({
        id: h.id,
        acao: h.acao,
        descricao: h.descricao,
        createdAt: h.createdAt.toISOString(),
        usuario: h.usuario?.name ?? null,
      }))}
      cert={{
        id: cert.id,
        numero: cert.numero,
        dataEmissao: cert.dataEmissao.toISOString(),
        dataVencimento: cert.dataVencimento ? cert.dataVencimento.toISOString() : null,
        tiposResiduos: cert.tiposResiduos,
        quantidadeTotal: cert.quantidadeTotal,
        peso: cert.peso,
        unidadeMedida: cert.unidadeMedida,
        formaDestinacao: cert.formaDestinacao,
        responsavel: cert.responsavel,
        observacao: cert.observacao,
        empresa: { razaoSocial: cert.empresa.razaoSocial },
        unidade: cert.unidade ? { nome: cert.unidade.nome, cidade: cert.unidade.cidade, uf: cert.unidade.uf } : null,
        coletor: { razaoSocial: cert.coletor.razaoSocial },
      }}
    />
  )
}
