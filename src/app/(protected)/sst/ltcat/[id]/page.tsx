import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LtcatDetailTabs } from './ltcat-detail-tabs'

export default async function LtcatDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ltcat = await prisma.lTCAT.findUnique({
    where: { id },
    include: {
      empresa: true,
      unidade: true,
    },
  })

  if (!ltcat) notFound()

  return (
    <LtcatDetailTabs
      ltcat={{
        id: ltcat.id,
        status: ltcat.status,
        responsavelTecnico: ltcat.responsavelTecnico,
        crea: ltcat.crea,
        art: ltcat.art,
        dataEmissao: ltcat.dataEmissao.toISOString(),
        vigencia: ltcat.vigencia ? ltcat.vigencia.toISOString() : null,
        ambientesAvaliados: ltcat.ambientesAvaliados,
        agentesNocivos: ltcat.agentesNocivos,
        observacao: ltcat.observacao,
        empresa: { razaoSocial: ltcat.empresa.razaoSocial },
        unidade: { nome: ltcat.unidade.nome, cidade: ltcat.unidade.cidade, uf: ltcat.unidade.uf },
      }}
    />
  )
}
