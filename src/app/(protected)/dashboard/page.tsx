import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const hoje    = new Date()
  const em30d   = new Date(hoje.getTime() + 30 * 86400000)
  const em60d   = new Date(hoje.getTime() + 60 * 86400000)

  const [
    pendenciasAbertas,
    pendenciasVencidas,
    docVencidos,
    docAVencer,
    taxasPendentes,
    certVencidas,
    licencasVencidas,
    licencasAVencer,
    totalEmpresas,
    totalColaboradores,
    asosVencidos,
    episCaVencidos,
    treinamentosVencidos,
    extVencidos,
    extAVencer,
    condAtrasadas,
    condPendentes,
    recursosVencidos,
    recursosAVencer,
    monitNaoConformes,
    monitTotal,
    recentesPendencias,
    proximosCert,
    proximosExt,
    proximosRec,
    empresasRaw,
  ] = await Promise.all([
    prisma.pendencia.count({ where: { status: { in: ['ABERTA', 'EM_ANDAMENTO'] } } }),
    prisma.pendencia.count({ where: { status: 'VENCIDA' } }),
    prisma.documentoLegal.count({ where: { status: 'VENCIDO' } }),
    prisma.documentoLegal.count({ where: { vencimento: { gte: hoje, lte: em30d }, status: 'VIGENTE' } }),
    prisma.taxa.count({ where: { status: 'PENDENTE' } }),
    prisma.certificacao.count({ where: { status: 'VENCIDO' } }),
    prisma.licencaAmbiental.count({ where: { vencimento: { lt: hoje } } }),
    prisma.licencaAmbiental.count({ where: { vencimento: { gte: hoje, lte: em60d } } }),
    prisma.empresa.count({ where: { status: 'ATIVO' } }),
    prisma.colaborador.count({ where: { status: 'ATIVO' } }),
    prisma.aSO.count({ where: { dataVencimento: { lt: hoje } } }),
    prisma.ePI.count({ where: { validade: { lt: hoje } } }),
    prisma.treinamento.count({ where: { dataVencimento: { lt: hoje } } }),
    prisma.extintor.count({ where: { proximaInspecao: { lt: hoje } } }),
    prisma.extintor.count({ where: { proximaInspecao: { gte: hoje, lte: em30d } } }),
    prisma.condicionante.count({ where: { status: 'ATRASADA' } }),
    prisma.condicionante.count({ where: { status: 'PENDENTE' } }),
    prisma.recursoHidrico.count({ where: { vencimento: { lt: hoje } } }),
    prisma.recursoHidrico.count({ where: { vencimento: { gte: hoje, lte: em60d } } }),
    prisma.monitoramentoAmbiental.count({ where: { conformidade: false } }),
    prisma.monitoramentoAmbiental.count(),
    prisma.pendencia.findMany({
      take: 6, orderBy: { prazo: 'asc' },
      include: { empresa: { select: { razaoSocial: true } } },
      where: { status: { in: ['ABERTA', 'EM_ANDAMENTO', 'VENCIDA'] } },
    }),
    prisma.certificacao.findMany({
      take: 4, orderBy: { vencimento: 'asc' },
      where: { vencimento: { gte: hoje, lte: em30d }, status: 'VIGENTE' },
      include: { empresa: { select: { razaoSocial: true } } },
    }),
    prisma.extintor.findMany({
      take: 4, orderBy: { proximaInspecao: 'asc' },
      where: { proximaInspecao: { gte: hoje, lte: em30d } },
      include: { empresa: { select: { razaoSocial: true } } },
    }),
    prisma.recursoHidrico.findMany({
      take: 4, orderBy: { vencimento: 'asc' },
      where: { vencimento: { gte: hoje, lte: em60d } },
      include: { empresa: { select: { razaoSocial: true } } },
    }),
    prisma.empresa.findMany({
      where: { status: 'ATIVO' },
      orderBy: { razaoSocial: 'asc' },
      take: 10,
      include: {
        _count: {
          select: {
            pendencias:          { where: { status: 'VENCIDA' } },
            licencasAmbientais:  { where: { vencimento: { lt: hoje } } },
            extintores:          { where: { proximaInspecao: { lt: hoje } } },
            recursosHidricos:    { where: { vencimento: { lt: hoje } } },
          },
        },
      },
    }),
  ])

  const kpis = {
    pendenciasAbertas, pendenciasVencidas,
    docVencidos, docAVencer,
    taxasPendentes, certVencidas,
    licencasVencidas, licencasAVencer,
    totalEmpresas, totalColaboradores,
    asosVencidos, episCaVencidos, treinamentosVencidos,
    extVencidos, extAVencer,
    condAtrasadas, condPendentes,
    recursosVencidos, recursosAVencer,
    monitNaoConformes, monitTotal,
  }

  const pendencias = recentesPendencias.map(p => ({
    id: p.id, descricao: p.descricao, status: p.status,
    prazo: p.prazo?.toISOString() ?? null, prioridade: p.prioridade, empresa: p.empresa.razaoSocial,
  }))

  const vencimentos = [
    ...proximosCert.map(c => ({ id: c.id, tipo: c.tipo, modulo: 'Certificação', vencimento: c.vencimento?.toISOString() ?? null, empresa: c.empresa.razaoSocial })),
    ...proximosExt.map(e => ({ id: e.id, tipo: `Extintor ${e.localizacao ?? ''}`.trim(), modulo: 'Extintor', vencimento: e.proximaInspecao?.toISOString() ?? null, empresa: e.empresa.razaoSocial })),
    ...proximosRec.map(r => ({ id: r.id, tipo: r.tipo.replace(/_/g, ' '), modulo: 'Rec. Hídrico', vencimento: r.vencimento?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
  ].sort((a, b) => {
    if (!a.vencimento) return 1
    if (!b.vencimento) return -1
    return new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()
  }).slice(0, 8)

  const empresas = empresasRaw.map(e => ({
    id: e.id, nome: e.razaoSocial,
    pendenciasVencidas: e._count.pendencias,
    licencasVencidas:   e._count.licencasAmbientais,
    extVencidos:        e._count.extintores,
    recursosVencidos:   e._count.recursosHidricos,
  }))

  return <DashboardClient kpis={kpis} pendencias={pendencias} vencimentos={vencimentos} empresas={empresas} />
}
