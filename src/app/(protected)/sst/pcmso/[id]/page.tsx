import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PcmsoDetailTabs } from './pcmso-detail-tabs'

export default async function PcmsoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pcmso = await prisma.pCMSO.findUnique({
    where: { id },
    include: {
      empresa: true,
      unidade: true,
      examesPrevistos: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!pcmso) notFound()

  return (
    <PcmsoDetailTabs
      pcmso={{
        id: pcmso.id,
        status: pcmso.status,
        medicoResponsavel: pcmso.medicoResponsavel,
        crm: pcmso.crm,
        clinica: pcmso.clinica,
        vigenciaInicial: pcmso.vigenciaInicial.toISOString(),
        vigenciaFinal: pcmso.vigenciaFinal ? pcmso.vigenciaFinal.toISOString() : null,
        observacao: pcmso.observacao,
        empresa: { razaoSocial: pcmso.empresa.razaoSocial },
        unidade: { nome: pcmso.unidade.nome, cidade: pcmso.unidade.cidade, uf: pcmso.unidade.uf },
        examesPrevistos: pcmso.examesPrevistos.map(e => ({
          id: e.id,
          tipo: e.tipo,
          periodicidade: e.periodicidade,
          funcoes: e.funcoes,
        })),
      }}
    />
  )
}
