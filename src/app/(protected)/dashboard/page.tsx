import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const hoje = new Date()
  const em30dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)
  const em7dias  = new Date(hoje.getTime() +  7 * 24 * 60 * 60 * 1000)

  const [
    pendenciasAbertas,
    pendenciasVencidas,
    docVencidos,
    docAVencer,
    taxasPendentes,
    certVencidas,
    licencasVencidas,
    totalEmpresas,
    totalColaboradores,
    asosVencidos,
    episVencidos,
    treinamentosVencidos,
    recentesPendencias,
    proximosVencimentos,
  ] = await Promise.all([
    prisma.pendencia.count({ where: { status: { in: ['ABERTA', 'EM_ANDAMENTO'] } } }),
    prisma.pendencia.count({ where: { status: 'VENCIDA' } }),
    prisma.documentoLegal.count({ where: { status: 'VENCIDO' } }),
    prisma.documentoLegal.count({ where: { vencimento: { gte: hoje, lte: em30dias }, status: 'VIGENTE' } }),
    prisma.taxa.count({ where: { status: 'PENDENTE' } }),
    prisma.certificacao.count({ where: { status: 'VENCIDO' } }),
    prisma.licencaAmbiental.count({ where: { status: 'VENCIDO' } }),
    prisma.empresa.count({ where: { status: 'ATIVO' } }),
    prisma.colaborador.count({ where: { status: 'ATIVO' } }),
    prisma.aSO.count({ where: { dataVencimento: { lt: hoje } } }),
    prisma.entregaEPI.count({ where: { dataVencimento: { lt: hoje } } }),
    prisma.treinamento.count({ where: { dataVencimento: { lt: hoje } } }),
    prisma.pendencia.findMany({
      take: 6,
      orderBy: { prazo: 'asc' },
      include: { empresa: { select: { razaoSocial: true } } },
      where: { status: { in: ['ABERTA', 'EM_ANDAMENTO', 'VENCIDA'] } },
    }),
    prisma.certificacao.findMany({
      take: 5,
      orderBy: { vencimento: 'asc' },
      where: { vencimento: { gte: hoje, lte: em30dias }, status: 'VIGENTE' },
      include: { empresa: { select: { razaoSocial: true } } },
    }),
  ])

  const kpis = {
    pendenciasAbertas,
    pendenciasVencidas,
    docVencidos,
    docAVencer,
    taxasPendentes,
    certVencidas,
    licencasVencidas,
    totalEmpresas,
    totalColaboradores,
    asosVencidos,
    episVencidos,
    treinamentosVencidos,
  }

  const pendencias = recentesPendencias.map(p => ({
    id: p.id,
    descricao: p.descricao,
    status: p.status,
    prazo: p.prazo?.toISOString() ?? null,
    prioridade: p.prioridade,
    empresa: p.empresa.razaoSocial,
  }))

  const vencimentos = proximosVencimentos.map(c => ({
    id: c.id,
    tipo: c.tipo,
    vencimento: c.vencimento?.toISOString() ?? null,
    empresa: c.empresa.razaoSocial,
  }))

  return <DashboardClient kpis={kpis} pendencias={pendencias} vencimentos={vencimentos} />
}
