import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const hoje  = new Date()
  const em30d = new Date(hoje.getTime() + 30 * 86400000)
  const em60d = new Date(hoje.getTime() + 60 * 86400000)

  const [
    pendenciasAbertas,
    pendenciasVencidas,
    licencasVencidas,
    licencasVencendo30,
    licencasVencendo60,
    episCaVencidos,
    treinamentosVencidos,
    extVencidos,
    extVencendo30,
    extVencendo60,
    condAtrasadas,
    condPendentes,
    recursosVencidos,
    recursosVencendo30,
    recursosVencendo60,
    monitNaoConformes,
    monitTotal,
    recentesPendencias,
    empresasRaw,
    totalEmpresas, totalColaboradores,
    totalPGR, totalPCMSO, totalLTCAT,
    totalEPI, totalEstoqueEPI, totalTreinamentos, totalComunicacoes,
    totalExtintores, totalAVCB,
    totalLicencas, totalCondicionantes, totalIBAMA, totalPGRS,
    totalRecursosHidricos, totalResiduosMTR, totalColetoras,
    totalCertificadosDest, totalColetaSeletiva, totalProdutosQuimicos,
    totalMonitoramentos,
    avcbVigentes, avcbVencidos, avcbVencendo30, avcbVencendo60,
    brigadasVencidas, simuladosPendentes,
    mtrEmitidos, destinacoesRealizadas,
    pgrVencidos, pgrVencendo30, pgrVencendo60,
    pcmsoVencidos, pcmsoVencendo30, pcmsoVencendo60,
    ltcatVencidos, ltcatVencendo30, ltcatVencendo60,
    pgrsVencidos, pgrsVencendo30, pgrsVencendo60,
    ibamaPendente,
    produtosQuimicosVencidos,
    mtrPendentes,
    certificadosPendentes,
    episCaVencendo30,
    episCaVencendo60,
    episAbaixoMinimo,
    episEntreguesAgg,
    episDevolvidosAgg,
  ] = await Promise.all([
    prisma.pendencia.count({ where: { status: { in: ['ABERTA', 'EM_ANDAMENTO'] } } }),
    prisma.pendencia.count({ where: { status: 'VENCIDA' } }),
    prisma.licencaAmbiental.count({ where: { vencimento: { lt: hoje } } }),
    prisma.licencaAmbiental.count({ where: { vencimento: { gte: hoje, lte: em30d } } }),
    prisma.licencaAmbiental.count({ where: { vencimento: { gte: hoje, lte: em60d } } }),
    prisma.ePI.count({ where: { validade: { lt: hoje } } }),
    prisma.treinamento.count({ where: { dataVencimento: { lt: hoje } } }),
    prisma.extintor.count({ where: { proximaInspecao: { lt: hoje } } }),
    prisma.extintor.count({ where: { proximaInspecao: { gte: hoje, lte: em30d } } }),
    prisma.extintor.count({ where: { proximaInspecao: { gte: hoje, lte: em60d } } }),
    prisma.condicionante.count({ where: { status: 'ATRASADA' } }),
    prisma.condicionante.count({ where: { status: 'PENDENTE' } }),
    prisma.recursoHidrico.count({ where: { vencimento: { lt: hoje } } }),
    prisma.recursoHidrico.count({ where: { vencimento: { gte: hoje, lte: em30d } } }),
    prisma.recursoHidrico.count({ where: { vencimento: { gte: hoje, lte: em60d } } }),
    prisma.monitoramentoAmbiental.count({ where: { conformidade: false } }),
    prisma.monitoramentoAmbiental.count(),
    prisma.pendencia.findMany({
      take: 6, orderBy: { prazo: 'asc' },
      include: { empresa: { select: { razaoSocial: true } } },
      where: { status: { in: ['ABERTA', 'EM_ANDAMENTO', 'VENCIDA'] } },
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
    prisma.empresa.count({ where: { status: 'ATIVO' } }),
    prisma.colaborador.count({ where: { status: 'ATIVO' } }),
    prisma.pGR.count(),
    prisma.pCMSO.count(),
    prisma.lTCAT.count(),
    prisma.ePI.count(),
    prisma.estoqueEPI.count(),
    prisma.treinamento.count(),
    prisma.comunicacaoSST.count(),
    prisma.extintor.count(),
    prisma.aVCB.count(),
    prisma.licencaAmbiental.count(),
    prisma.condicionante.count(),
    prisma.registroIBAMA.count(),
    prisma.pGRSAmbiental.count(),
    prisma.recursoHidrico.count(),
    prisma.controleResiduo.count(),
    prisma.empresaColetora.count(),
    prisma.certificadoDestinacao.count(),
    prisma.coletaSeletiva.count(),
    prisma.produtoQuimico.count(),
    prisma.monitoramentoAmbiental.count(),
    prisma.aVCB.count({ where: { status: 'VIGENTE' } }),
    prisma.aVCB.count({ where: { dataValidade: { lt: hoje } } }),
    prisma.aVCB.count({ where: { dataValidade: { gte: hoje, lte: em30d } } }),
    prisma.aVCB.count({ where: { dataValidade: { gte: hoje, lte: em60d } } }),
    prisma.brigadaIncendio.count({ where: { dataValidade: { lt: hoje } } }),
    prisma.simuladoIncendio.count({ where: { status: 'PENDENTE' } }),
    prisma.controleResiduo.count({ where: { mtr: { not: null } } }),
    prisma.controleResiduo.count({ where: { situacao: 'DESTINADO' } }),
    // PGR usa dataRevisao (nullable) como referência de vencimento — não há campo de vigência único
    prisma.pGR.count({ where: { dataRevisao: { lt: hoje } } }),
    prisma.pGR.count({ where: { dataRevisao: { gte: hoje, lte: em30d } } }),
    prisma.pGR.count({ where: { dataRevisao: { gte: hoje, lte: em60d } } }),
    // PCMSO usa vigenciaFinal (nullable)
    prisma.pCMSO.count({ where: { vigenciaFinal: { lt: hoje } } }),
    prisma.pCMSO.count({ where: { vigenciaFinal: { gte: hoje, lte: em30d } } }),
    prisma.pCMSO.count({ where: { vigenciaFinal: { gte: hoje, lte: em60d } } }),
    // LTCAT usa vigencia (nullable)
    prisma.lTCAT.count({ where: { vigencia: { lt: hoje } } }),
    prisma.lTCAT.count({ where: { vigencia: { gte: hoje, lte: em30d } } }),
    prisma.lTCAT.count({ where: { vigencia: { gte: hoje, lte: em60d } } }),
    // PGRS usa dataVigencia (obrigatório)
    prisma.pGRSAmbiental.count({ where: { dataVigencia: { lt: hoje } } }),
    prisma.pGRSAmbiental.count({ where: { dataVigencia: { gte: hoje, lte: em30d } } }),
    prisma.pGRSAmbiental.count({ where: { dataVigencia: { gte: hoje, lte: em60d } } }),
    // IBAMA pendente = status VENCIDO
    prisma.registroIBAMA.count({ where: { status: 'VENCIDO' } }),
    // FISPQ vencido = documento ausente (não há campo de data no cadastro)
    prisma.produtoQuimico.count({ where: { fispq: null } }),
    // MTR pendente = resíduo sem número de MTR emitido
    prisma.controleResiduo.count({ where: { mtr: null } }),
    // Certificado pendente = resíduo já destinado mas sem certificado vinculado
    prisma.controleResiduo.count({ where: { situacao: 'DESTINADO', certificadoDest: null } }),
    prisma.ePI.count({ where: { validade: { gte: hoje, lte: em30d } } }),
    prisma.ePI.count({ where: { validade: { gte: hoje, lte: em60d } } }),
    prisma.ePI.findMany({ select: { quantidadeEstoque: true, estoqueMinimo: true } }).then(list => list.filter(e => e.quantidadeEstoque < e.estoqueMinimo).length),
    prisma.entregaEPI.aggregate({ _sum: { quantidade: true } }),
    prisma.entregaEPI.aggregate({ _sum: { quantidadeDevolvida: true } }),
  ])

  const kpis = {
    pendenciasAbertas, pendenciasVencidas,
    licencasVencidas, licencasVencendo30, licencasVencendo60,
    episCaVencidos, treinamentosVencidos,
    extVencidos, extVencendo30, extVencendo60,
    condAtrasadas, condPendentes,
    recursosVencidos, recursosVencendo30, recursosVencendo60,
    monitNaoConformes, monitTotal,
    avcbVigentes, avcbVencidos, avcbVencendo30, avcbVencendo60,
    brigadasVencidas, simuladosPendentes,
    residuosCadastrados: totalResiduosMTR, mtrEmitidos, destinacoesRealizadas,
    empresasColetoras: totalColetoras, certificadosDestinacao: totalCertificadosDest, coletaSeletiva: totalColetaSeletiva,
    pgrVencidos, pgrVencendo30, pgrVencendo60,
    pcmsoVencidos, pcmsoVencendo30, pcmsoVencendo60,
    ltcatVencidos, ltcatVencendo30, ltcatVencendo60,
    pgrsVencidos, pgrsVencendo30, pgrsVencendo60,
    ibamaPendente, produtosQuimicosVencidos, mtrPendentes, certificadosPendentes,
    episCaVencendo30, episCaVencendo60, episAbaixoMinimo,
    episEntregues: episEntreguesAgg._sum.quantidade ?? 0,
    episDevolvidos: episDevolvidosAgg._sum.quantidadeDevolvida ?? 0,
  }

  const moduleCounts = {
    totalEmpresas, totalColaboradores,
    totalPGR, totalPCMSO, totalLTCAT,
    totalEPI, totalEstoqueEPI, totalTreinamentos, totalComunicacoes,
    totalExtintores, totalAVCB,
    totalLicencas, totalCondicionantes, totalIBAMA, totalPGRS,
    totalRecursosHidricos, totalResiduosMTR, totalColetoras,
    totalCertificadosDest, totalColetaSeletiva, totalProdutosQuimicos,
    totalMonitoramentos,
  }

  const pendencias = recentesPendencias.map(p => ({
    id: p.id, descricao: p.descricao, status: p.status,
    prazo: p.prazo?.toISOString() ?? null, prioridade: p.prioridade, empresa: p.empresa.razaoSocial,
  }))

  // Próximos Vencimentos — busca detalhada por módulo (vencidos + vencendo até 60 dias), com categoria por aba de Atenção Imediata
  const takeN = 8
  const [
    vPGR, vPCMSO, vLTCAT, vEpi, vTreinamento, vExtintor,
    vLicenca, vCondicionante, vIbama, vRecursoHidrico, vProdutoQuimico, vMonitoramento,
    vAvcb, vBrigada, vSimulado,
    vResiduo, vPgrs, vCertificadoDest, vColetora,
  ] = await Promise.all([
    prisma.pGR.findMany({ where: { dataRevisao: { lte: em60d } }, orderBy: { dataRevisao: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.pCMSO.findMany({ where: { vigenciaFinal: { lte: em60d } }, orderBy: { vigenciaFinal: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.lTCAT.findMany({ where: { vigencia: { lte: em60d } }, orderBy: { vigencia: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.ePI.findMany({ where: { validade: { lte: em60d } }, orderBy: { validade: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.treinamento.findMany({ where: { dataVencimento: { lte: em60d } }, orderBy: { dataVencimento: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.extintor.findMany({ where: { proximaInspecao: { lte: em60d } }, orderBy: { proximaInspecao: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.licencaAmbiental.findMany({ where: { vencimento: { lte: em60d } }, orderBy: { vencimento: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.condicionante.findMany({ where: { prazo: { lte: em60d } }, orderBy: { prazo: 'asc' }, take: takeN, include: { licenca: { include: { empresa: { select: { razaoSocial: true } } } } } }),
    prisma.registroIBAMA.findMany({ where: { validadeCR: { lte: em60d } }, orderBy: { validadeCR: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.recursoHidrico.findMany({ where: { vencimento: { lte: em60d } }, orderBy: { vencimento: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.produtoQuimico.findMany({ where: { fispq: null }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.monitoramentoAmbiental.findMany({ where: { dataProxima: { lte: em60d } }, orderBy: { dataProxima: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.aVCB.findMany({ where: { dataValidade: { lte: em60d } }, orderBy: { dataValidade: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.brigadaIncendio.findMany({ where: { dataValidade: { lte: em60d } }, orderBy: { dataValidade: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.simuladoIncendio.findMany({ where: { status: 'PENDENTE', dataPrevista: { lte: em60d } }, orderBy: { dataPrevista: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.controleResiduo.findMany({ where: { situacao: 'AGUARDANDO_COLETA', dataColeta: { lte: em60d } }, orderBy: { dataColeta: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.pGRSAmbiental.findMany({ where: { dataVigencia: { lte: em60d } }, orderBy: { dataVigencia: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.certificadoDestinacao.findMany({ where: { dataVencimento: { lte: em60d } }, orderBy: { dataVencimento: 'asc' }, take: takeN, include: { empresa: { select: { razaoSocial: true } } } }),
    prisma.empresaColetora.findMany({ where: { validadeLicenca: { lte: em60d } }, orderBy: { validadeLicenca: 'asc' }, take: takeN }),
  ])

  type VencItem = { id: string; tipo: string; modulo: string; categoria: 'sst' | 'ma' | 'avcb' | 'residuos'; vencimento: string | null; empresa: string }
  const vencimentosDetalhados: VencItem[] = [
    ...vPGR.map(r => ({ id: r.id, tipo: `PGR — v.${r.versao}`, modulo: 'PGR', categoria: 'sst' as const, vencimento: r.dataRevisao?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vPCMSO.map(r => ({ id: r.id, tipo: 'PCMSO', modulo: 'PCMSO', categoria: 'sst' as const, vencimento: r.vigenciaFinal?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vLTCAT.map(r => ({ id: r.id, tipo: 'LTCAT', modulo: 'LTCAT', categoria: 'sst' as const, vencimento: r.vigencia?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vEpi.map(r => ({ id: r.id, tipo: `${r.nome} (CA ${r.ca})`, modulo: 'EPI', categoria: 'sst' as const, vencimento: r.validade?.toISOString() ?? null, empresa: r.empresa?.razaoSocial ?? '—' })),
    ...vTreinamento.map(r => ({ id: r.id, tipo: r.nome, modulo: 'Treinamento', categoria: 'sst' as const, vencimento: r.dataVencimento?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vExtintor.map(e => ({ id: e.id, tipo: `Extintor ${e.localizacao ?? ''}`.trim(), modulo: 'Extintor', categoria: 'sst' as const, vencimento: e.proximaInspecao?.toISOString() ?? null, empresa: e.empresa.razaoSocial })),
    ...vLicenca.map(r => ({ id: r.id, tipo: `Licença ${r.tipo}`, modulo: 'Licença', categoria: 'ma' as const, vencimento: r.vencimento?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vCondicionante.map(r => ({ id: r.id, tipo: r.descricao, modulo: 'Condicionante', categoria: 'ma' as const, vencimento: r.prazo?.toISOString() ?? null, empresa: r.licenca.empresa.razaoSocial })),
    ...vIbama.map(r => ({ id: r.id, tipo: `IBAMA${r.numeroCTF ? ` — CTF ${r.numeroCTF}` : ''}`, modulo: 'IBAMA', categoria: 'ma' as const, vencimento: r.validadeCR?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vRecursoHidrico.map(r => ({ id: r.id, tipo: r.tipo.replace(/_/g, ' '), modulo: 'Rec. Hídrico', categoria: 'ma' as const, vencimento: r.vencimento?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vProdutoQuimico.map(r => ({ id: r.id, tipo: `${r.nome} — FISPQ ausente`, modulo: 'Produto Químico', categoria: 'ma' as const, vencimento: null, empresa: r.empresa?.razaoSocial ?? '—' })),
    ...vMonitoramento.map(r => ({ id: r.id, tipo: r.parametro, modulo: 'Monitoramento', categoria: 'ma' as const, vencimento: r.dataProxima?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vAvcb.map(r => ({ id: r.id, tipo: `${r.tipo} nº ${r.numero}`, modulo: r.tipo, categoria: 'avcb' as const, vencimento: r.dataValidade.toISOString(), empresa: r.empresa.razaoSocial })),
    ...vBrigada.map(r => ({ id: r.id, tipo: `Brigada — ${r.responsavel}`, modulo: 'Brigada', categoria: 'avcb' as const, vencimento: r.dataValidade.toISOString(), empresa: r.empresa.razaoSocial })),
    ...vSimulado.map(r => ({ id: r.id, tipo: 'Simulado de incêndio', modulo: 'Simulado', categoria: 'avcb' as const, vencimento: r.dataPrevista?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vResiduo.map(r => ({ id: r.id, tipo: r.descricao, modulo: 'Resíduo/MTR', categoria: 'residuos' as const, vencimento: r.dataColeta?.toISOString() ?? null, empresa: r.empresa?.razaoSocial ?? '—' })),
    ...vPgrs.map(r => ({ id: r.id, tipo: `PGRS — v.${r.versao}`, modulo: 'PGRS', categoria: 'residuos' as const, vencimento: r.dataVigencia.toISOString(), empresa: r.empresa.razaoSocial })),
    ...vCertificadoDest.map(r => ({ id: r.id, tipo: `Certificado ${r.numero ?? ''}`.trim(), modulo: 'Cert. Destinação', categoria: 'residuos' as const, vencimento: r.dataVencimento?.toISOString() ?? null, empresa: r.empresa.razaoSocial })),
    ...vColetora.map(r => ({ id: r.id, tipo: `Licença — ${r.razaoSocial}`, modulo: 'Empresa Coletora', categoria: 'residuos' as const, vencimento: r.validadeLicenca?.toISOString() ?? null, empresa: r.razaoSocial })),
  ].sort((a, b) => {
    if (!a.vencimento) return 1
    if (!b.vencimento) return -1
    return new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()
  })

  const empresas = empresasRaw.map(e => ({
    id: e.id, nome: e.razaoSocial,
    pendenciasVencidas: e._count.pendencias,
    licencasVencidas:   e._count.licencasAmbientais,
    extVencidos:        e._count.extintores,
    recursosVencidos:   e._count.recursosHidricos,
  }))

  return <DashboardClient kpis={kpis} pendencias={pendencias} vencimentos={vencimentosDetalhados} empresas={empresas} moduleCounts={moduleCounts} />
}
