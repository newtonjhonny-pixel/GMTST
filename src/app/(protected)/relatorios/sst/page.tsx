import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FiltroRelatorio } from '@/components/relatorios/FiltroRelatorio'

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function KPI({ label, value, sub, color, bg }: { label: string; value: string | number; sub?: string; color?: string; bg?: string }) {
  return (
    <div style={{ background: bg ?? 'var(--bg-card)', border: `1px solid ${color ? color + '33' : 'var(--border)'}`, borderRadius: 12, padding: '18px 22px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: color ?? 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function Secao({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>{children}</div>
    </div>
  )
}

export default async function RelatorioSSTPage({ searchParams }: { searchParams: Promise<{ empresaId?: string; ano?: string }> }) {
  const { empresaId, ano: anoStr } = await searchParams
  const ano  = parseInt(anoStr ?? String(new Date().getFullYear()))
  const ini  = new Date(ano, 0, 1)
  const fim  = new Date(ano, 11, 31, 23, 59, 59)
  const hoje = new Date()

  const where = empresaId ? { empresaId } : {}
  const wherePeriodo = { ...where, createdAt: { gte: ini, lte: fim } }

  const [
    totalAcidentes, acidCat, acidAfastamento, acidEsocial,
    diasPerdidosAgg,
    totalTreinamentos, treinPeriodo,
    asoAptos, asoInaptos, asoAVencer,
    totalEpis, episCaVencido,
    totalOs, osPendentes,
    totalExt, extVencidos, extAVencer,
    totalEquip, equipVencidos,
    membrosCipa, reunioesCipa, cursosNr5,
    totalDireitoRecusa, drPendentes,
  ] = await Promise.all([
    prisma.acidente.count({ where }),
    prisma.acidente.count({ where: { ...where, cat: true } }),
    prisma.acidente.count({ where: { ...where, diasPerdidos: { gt: 0 } } }),
    prisma.acidente.count({ where: { ...where, eSocial: true } }),
    prisma.acidente.aggregate({ where, _sum: { diasPerdidos: true } }),
    prisma.treinamento.count({ where }),
    prisma.treinamento.count({ where: { ...where, dataRealizacao: { gte: ini, lte: fim } } }),
    prisma.aSO.count({ where: empresaId ? { colaborador: { unidade: { empresaId } } } : {} }),
    prisma.aSO.count({ where: { resultado: 'INAPTO', ...(empresaId ? { colaborador: { unidade: { empresaId } } } : {}) } }),
    prisma.aSO.count({ where: { dataVencimento: { gte: hoje, lte: new Date(hoje.getTime() + 90 * 86400000) }, ...(empresaId ? { colaborador: { unidade: { empresaId } } } : {}) } }),
    prisma.entregaEPI.count({ where: empresaId ? { colaborador: { unidade: { empresaId } } } : {} }),
    prisma.ePI.count({ where: { validade: { lt: hoje } } }),
    prisma.ordemServico.count({ where }),
    prisma.ordemServico.count({ where: { ...where, assinado: false } }),
    prisma.extintor.count({ where }),
    prisma.extintor.count({ where: { ...where, proximaInspecao: { lt: hoje } } }),
    prisma.extintor.count({ where: { ...where, proximaInspecao: { gte: hoje, lte: new Date(hoje.getTime() + 30 * 86400000) } } }),
    prisma.equipamentoPressao.count({ where }),
    prisma.equipamentoPressao.count({ where: { ...where, proximaInspecao: { lt: hoje } } }),
    prisma.membroCipaa.count({ where: { status: 'ATIVO', ...(empresaId ? { cipa: { empresaId } } : {}) } }),
    prisma.reuniaoCipaa.count({ where: { data: { gte: ini, lte: fim }, ...where } }),
    prisma.cursoCipaa.count({ where }),
    prisma.direitoRecusa.count({ where }),
    prisma.direitoRecusa.count({ where: { ...where, resolvido: false } }),
  ])

  const diasPerdidos = diasPerdidosAgg._sum.diasPerdidos ?? 0
  const taxaCat = totalAcidentes > 0 ? ((acidCat / totalAcidentes) * 100).toFixed(1) : '0'

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 print:hidden">
        <Link href="/relatorios" style={{ color: 'var(--text-muted)', display: 'flex' }}><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Indicadores SST</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Segurança e Saúde no Trabalho — ano {ano}</p>
        </div>
      </div>

      <div className="print:hidden">
        <Suspense><FiltroRelatorio /></Suspense>
      </div>

      <div className="print:block hidden mb-4">
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Relatório de Indicadores SST — {ano}</h1>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Gerado em {new Date().toLocaleDateString('pt-BR')} · GMTST</p>
      </div>

      <Secao title="Acidentes do Trabalho">
        <KPI label="Total de Acidentes" value={totalAcidentes} />
        <KPI label="Com CAT Emitida" value={acidCat} sub={`${taxaCat}% do total`} color={acidCat > 0 ? '#d97706' : undefined} />
        <KPI label="Com Afastamento" value={acidAfastamento} color={acidAfastamento > 0 ? '#dc2626' : undefined} />
        <KPI label="Notif. eSocial" value={acidEsocial} />
        <KPI label="Total Dias Perdidos" value={diasPerdidos} sub="soma dos afastamentos" color={diasPerdidos > 0 ? '#dc2626' : undefined} />
      </Secao>

      <Secao title="Treinamentos">
        <KPI label="Total Cadastrado" value={totalTreinamentos} />
        <KPI label={`Realizados em ${ano}`} value={treinPeriodo} color={treinPeriodo === 0 ? '#dc2626' : '#16a34a'} />
      </Secao>

      <Secao title="ASO — Saúde Ocupacional">
        <KPI label="Trabalhadores Aptos" value={asoAptos} color="#16a34a" />
        <KPI label="Inaptos" value={asoInaptos} color={asoInaptos > 0 ? '#dc2626' : undefined} />
        <KPI label="A Vencer em 90d" value={asoAVencer} color={asoAVencer > 0 ? '#d97706' : undefined} />
      </Secao>

      <Secao title="EPIs">
        <KPI label="Entregas Registradas" value={totalEpis} />
        <KPI label="CAs Vencidos" value={episCaVencido} color={episCaVencido > 0 ? '#dc2626' : undefined} />
      </Secao>

      <Secao title="Ordens de Serviço — NR-1">
        <KPI label="Total de OS" value={totalOs} />
        <KPI label="Pendentes de Assinatura" value={osPendentes} color={osPendentes > 0 ? '#d97706' : undefined} sub={totalOs > 0 ? `${((osPendentes / totalOs) * 100).toFixed(0)}% pendente` : undefined} />
      </Secao>

      <Secao title="Extintores — NR-23">
        <KPI label="Total" value={totalExt} />
        <KPI label="Inspeção Vencida" value={extVencidos} color={extVencidos > 0 ? '#dc2626' : undefined} />
        <KPI label="A Vencer em 30d" value={extAVencer} color={extAVencer > 0 ? '#d97706' : undefined} />
        <KPI label="Em Dia" value={totalExt - extVencidos - extAVencer} color="#16a34a" />
      </Secao>

      <Secao title="Equipamentos sob Pressão — NR-13">
        <KPI label="Total" value={totalEquip} />
        <KPI label="Inspeção Vencida" value={equipVencidos} color={equipVencidos > 0 ? '#dc2626' : undefined} />
        <KPI label="Em Dia" value={totalEquip - equipVencidos} color="#16a34a" />
      </Secao>

      <Secao title="CIPAA — NR-5">
        <KPI label="Membros Ativos" value={membrosCipa} />
        <KPI label={`Reuniões em ${ano}`} value={reunioesCipa} color={reunioesCipa === 0 ? '#d97706' : '#16a34a'} />
        <KPI label="Cursos NR-5" value={cursosNr5} />
      </Secao>

      <Secao title="Direito de Recusa — NR-1">
        <KPI label="Registros Totais" value={totalDireitoRecusa} />
        <KPI label="Pendentes de Resolução" value={drPendentes} color={drPendentes > 0 ? '#d97706' : undefined} />
      </Secao>
    </div>
  )
}
