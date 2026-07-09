import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { IbamaDetailTabs } from './ibama-detail-tabs'

export default async function IbamaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const registro = await prisma.registroIBAMA.findUnique({
    where: { id },
    include: { empresa: true, unidade: true },
  })

  if (!registro) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'REGISTRO_IBAMA', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <IbamaDetailTabs
      historico={historico.map(h => ({
        id: h.id, acao: h.acao, descricao: h.descricao,
        createdAt: h.createdAt.toISOString(), usuario: h.usuario?.name ?? null,
      }))}
      registro={{
        id: registro.id,
        numeroCTF: registro.numeroCTF,
        certificadoReg: registro.certificadoReg,
        validadeCR: registro.validadeCR ? registro.validadeCR.toISOString() : null,
        periodoRAPP: registro.periodoRAPP,
        dataEnvioRAPP: registro.dataEnvioRAPP ? registro.dataEnvioRAPP.toISOString() : null,
        protocolo: registro.protocolo,
        responsavel: registro.responsavel,
        observacao: registro.observacao,
        status: registro.status,
        empresa: { razaoSocial: registro.empresa.razaoSocial },
        unidade: registro.unidade ? { nome: registro.unidade.nome, cidade: registro.unidade.cidade, uf: registro.unidade.uf } : null,
      }}
    />
  )
}
