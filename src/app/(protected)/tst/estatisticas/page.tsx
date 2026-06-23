import { prisma } from '@/lib/prisma'

function Card({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: color ?? 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 16 }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>{children}</div>
    </div>
  )
}

export default async function EstatisticasPage() {
  const anoAtual = new Date().getFullYear()
  const inicio   = new Date(anoAtual, 0, 1)

  const [
    totalAcidentes, acidComCat, acidEsocial, acidComAfastamento,
    totalTreinamentos, treinAno, totalAsos, asosPendentes,
    totalEpis, episVencidos, totalOs, osPendentes,
    totalExtintores, extVencidos, totalEquipsPressao, equipVencidos,
    totalDireitoRecusa, drPendentes,
    totalComunicacoes, comAno,
  ] = await Promise.all([
    prisma.acidente.count(),
    prisma.acidente.count({ where: { cat: true } }),
    prisma.acidente.count({ where: { eSocial: true } }),
    prisma.acidente.count({ where: { diasPerdidos: { gt: 0 } } }),
    prisma.treinamento.count(),
    prisma.treinamento.count({ where: { dataRealizacao: { gte: inicio } } }),
    prisma.aSO.count(),
    prisma.aSO.count({ where: { resultado: 'APTO' } }),
    prisma.entregaEPI.count(),
    prisma.ePI.count({ where: { validade: { lt: new Date() } } }),
    prisma.ordemServico.count(),
    prisma.ordemServico.count({ where: { assinado: false } }),
    prisma.extintor.count(),
    prisma.extintor.count({ where: { proximaInspecao: { lt: new Date() } } }),
    prisma.equipamentoPressao.count(),
    prisma.equipamentoPressao.count({ where: { proximaInspecao: { lt: new Date() } } }),
    prisma.direitoRecusa.count(),
    prisma.direitoRecusa.count({ where: { resolvido: false } }),
    prisma.comunicacaoSST.count(),
    prisma.comunicacaoSST.count({ where: { data: { gte: inicio } } }),
  ])

  const diasPerdidosResult = await prisma.acidente.aggregate({ _sum: { diasPerdidos: true } })
  const totalDiasPerdidos  = diasPerdidosResult._sum.diasPerdidos ?? 0

  const taxaCat     = totalAcidentes > 0 ? ((acidComCat / totalAcidentes) * 100).toFixed(1) : '0'
  const taxaEsocial = totalAcidentes > 0 ? ((acidEsocial / totalAcidentes) * 100).toFixed(1) : '0'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Estatísticas SST</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Indicadores de Segurança e Saúde no Trabalho — {anoAtual}</p>
      </div>

      <Section title="Acidentes do Trabalho">
        <Card title="Total de Acidentes" value={totalAcidentes} />
        <Card title="Com CAT Emitida" value={acidComCat} sub={`${taxaCat}% do total`} color={acidComCat > 0 ? '#d97706' : undefined} />
        <Card title="Notif. eSocial" value={acidEsocial} sub={`${taxaEsocial}% do total`} />
        <Card title="Com Afastamento" value={acidComAfastamento} color={acidComAfastamento > 0 ? '#dc2626' : undefined} />
        <Card title="Total Dias Perdidos" value={totalDiasPerdidos} sub="soma dos afastamentos" color={totalDiasPerdidos > 0 ? '#dc2626' : undefined} />
      </Section>

      <Section title="Treinamentos">
        <Card title="Total de Treinamentos" value={totalTreinamentos} />
        <Card title={`Realizados em ${anoAtual}`} value={treinAno} color={treinAno === 0 ? '#dc2626' : '#16a34a'} />
      </Section>

      <Section title="ASO / Saúde Ocupacional">
        <Card title="Total de ASOs" value={totalAsos} />
        <Card title="Trabalhadores Aptos" value={asosPendentes} color="#16a34a" />
      </Section>

      <Section title="EPIs">
        <Card title="Entregas Registradas" value={totalEpis} />
        <Card title="EPIs com CA Vencido" value={episVencidos} color={episVencidos > 0 ? '#dc2626' : undefined} />
      </Section>

      <Section title="Ordens de Serviço — NR-1">
        <Card title="Total de OS" value={totalOs} />
        <Card title="Pendentes de Assinatura" value={osPendentes} color={osPendentes > 0 ? '#d97706' : undefined} />
      </Section>

      <Section title="Extintores — NR-23">
        <Card title="Total de Extintores" value={totalExtintores} />
        <Card title="Com Inspeção Vencida" value={extVencidos} color={extVencidos > 0 ? '#dc2626' : undefined} />
      </Section>

      <Section title="Equipamentos sob Pressão — NR-13">
        <Card title="Total de Equipamentos" value={totalEquipsPressao} />
        <Card title="Com Inspeção Vencida" value={equipVencidos} color={equipVencidos > 0 ? '#dc2626' : undefined} />
      </Section>

      <Section title="Comunicação SST">
        <Card title="Total de Registros" value={totalComunicacoes} />
        <Card title={`Ações em ${anoAtual}`} value={comAno} color={comAno === 0 ? '#d97706' : '#16a34a'} />
      </Section>

      <Section title="Direito de Recusa — NR-1">
        <Card title="Total de Registros" value={totalDireitoRecusa} />
        <Card title="Pendentes de Resolução" value={drPendentes} color={drPendentes > 0 ? '#d97706' : undefined} />
      </Section>
    </div>
  )
}
