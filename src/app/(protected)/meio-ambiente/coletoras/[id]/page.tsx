import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ColetoraDetailTabs } from './coletora-detail-tabs'

export default async function ColetoraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const coletora = await prisma.empresaColetora.findUnique({ where: { id } })

  if (!coletora) notFound()

  const historico = await prisma.historico.findMany({
    where: { entidade: 'EMPRESA_COLETORA', entidadeId: id },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <ColetoraDetailTabs
      historico={historico.map(h => ({
        id: h.id,
        acao: h.acao,
        descricao: h.descricao,
        createdAt: h.createdAt.toISOString(),
        usuario: h.usuario?.name ?? null,
      }))}
      coletora={{
        id: coletora.id,
        razaoSocial: coletora.razaoSocial,
        nomeFantasia: coletora.nomeFantasia,
        cnpj: coletora.cnpj,
        telefone: coletora.telefone,
        email: coletora.email,
        responsavel: coletora.responsavel,
        licencaAmbiental: coletora.licencaAmbiental,
        numeroLicenca: coletora.numeroLicenca,
        validadeLicenca: coletora.validadeLicenca ? coletora.validadeLicenca.toISOString() : null,
        endereco: coletora.endereco,
        municipio: coletora.municipio,
        estado: coletora.estado,
        tiposResiduos: coletora.tiposResiduos,
        status: coletora.status,
        observacao: coletora.observacao,
      }}
    />
  )
}
