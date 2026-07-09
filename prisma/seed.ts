// Carrega o .env antes de qualquer import que leia process.env
import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('\n❌ DATABASE_URL não definida.')
  console.error('   Configure o arquivo .env com a URL do PostgreSQL interno da NEVION.')
  console.error('   Exemplo: DATABASE_URL="postgresql://gestaotst_user:senha@njsistemas-postgres:5432/gestaotst_prod?schema=public"\n')
  process.exit(1)
}

// Prisma v7 requer o PrismaPg adapter para conexão com PostgreSQL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Iniciando seed do GestãoTST...')

  // ── Perfis de Acesso ────────────────────────────────────────────────────────
  const TODAS_PERMISSOES = [
    'CADASTROS_EMPRESAS', 'CADASTROS_COLABORADORES',
    'SST_PGR', 'SST_PCMSO', 'SST_LTCAT', 'SST_EPIS', 'SST_TREINAMENTOS', 'SST_AVCB',
    'MA_LICENCAS', 'MA_CONDICIONANTES', 'MA_IBAMA', 'MA_RESIDUOS', 'MA_RECURSOS_HIDRICOS', 'MA_PRODUTOS_QUIMICOS', 'MA_MONITORAMENTOS',
    'COMPLIANCE_CERTIFICACOES', 'COMPLIANCE_TAXAS', 'COMPLIANCE_DOCUMENTOS',
    'GESTAO_PENDENCIAS', 'GESTAO_RELATORIOS', 'GESTAO_AUDITORIA',
  ]

  const perfilAdmin = await prisma.perfil.upsert({
    where: { nome: 'Administrador' },
    update: {},
    create: {
      nome: 'Administrador',
      descricao: 'Acesso total a todos os módulos do sistema',
      permissoes: TODAS_PERMISSOES,
      ativo: true,
    },
  })

  const perfilAnalista = await prisma.perfil.upsert({
    where: { nome: 'Analista' },
    update: {},
    create: {
      nome: 'Analista',
      descricao: 'Acesso operacional aos módulos de SST e Meio Ambiente',
      permissoes: [
        'CADASTROS_EMPRESAS', 'CADASTROS_COLABORADORES',
        'SST_PGR', 'SST_PCMSO', 'SST_LTCAT', 'SST_EPIS', 'SST_TREINAMENTOS', 'SST_AVCB',
        'MA_LICENCAS', 'MA_CONDICIONANTES', 'MA_IBAMA', 'MA_RESIDUOS', 'MA_RECURSOS_HIDRICOS', 'MA_PRODUTOS_QUIMICOS', 'MA_MONITORAMENTOS',
        'GESTAO_PENDENCIAS', 'GESTAO_RELATORIOS',
      ],
      ativo: true,
    },
  })

  const perfilTecnico = await prisma.perfil.upsert({
    where: { nome: 'Técnico' },
    update: {},
    create: {
      nome: 'Técnico',
      descricao: 'Acesso restrito à operação de campo (EPIs, treinamentos, AVCB)',
      permissoes: ['SST_EPIS', 'SST_TREINAMENTOS', 'SST_AVCB', 'GESTAO_PENDENCIAS'],
      ativo: true,
    },
  })

  console.log('✅ Perfis de acesso criados/atualizados (Administrador, Analista, Técnico)')

  // ── Usuários ─────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gestaotst.com.br' },
    update: { role: 'ADMINISTRADOR', ativo: true, perfilId: perfilAdmin.id },
    create: {
      name: 'Administrador',
      email: 'admin@gestaotst.com.br',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMINISTRADOR',
      perfilId: perfilAdmin.id,
      ativo: true,
    },
  })

  const analista = await prisma.user.upsert({
    where: { email: 'analista@gestaotst.com.br' },
    update: { perfilId: perfilAnalista.id },
    create: {
      name: 'Ana Silva',
      email: 'analista@gestaotst.com.br',
      password: await bcrypt.hash('analista123', 12),
      role: 'ANALISTA_TST',
      perfilId: perfilAnalista.id,
      ativo: true,
    },
  })

  console.log('✅ Usuários criados/atualizados')
  console.log('   → admin@gestaotst.com.br / admin123 (Perfil: Administrador)')
  console.log('   → analista@gestaotst.com.br / analista123 (Perfil: Analista)')

  // ── Empresas ──────────────────────────────────────────────────────────────
  const empresa1 = await prisma.empresa.upsert({
    where: { cnpj: '12345678000100' },
    update: {},
    create: {
      codigo: 'EMP001',
      razaoSocial: 'Metalúrgica Santana Ltda',
      cnpj: '12345678000100',
      status: 'ATIVO',
    },
  })

  const empresa2 = await prisma.empresa.upsert({
    where: { cnpj: '98765432000199' },
    update: {},
    create: {
      codigo: 'EMP002',
      razaoSocial: 'Indústria Química Brasil S.A.',
      cnpj: '98765432000199',
      status: 'ATIVO',
    },
  })

  console.log('✅ Empresas criadas')

  // ── Unidades ──────────────────────────────────────────────────────────────
  const unidade1 = await prisma.unidade.upsert({
    where: { id: 'unidade-001' },
    update: {},
    create: {
      id: 'unidade-001',
      empresaId: empresa1.id,
      nome: 'Unidade Matriz - São Paulo',
      cidade: 'São Paulo',
      uf: 'SP',
      responsavelTST: 'Carlos Segurança',
      responsavelMeioAmb: 'Maria Ambiente',
      status: 'ATIVO',
    },
  })

  const unidade2 = await prisma.unidade.upsert({
    where: { id: 'unidade-002' },
    update: {},
    create: {
      id: 'unidade-002',
      empresaId: empresa1.id,
      nome: 'Filial Campinas',
      cidade: 'Campinas',
      uf: 'SP',
      responsavelTST: 'João TST',
      status: 'ATIVO',
    },
  })

  const unidade3 = await prisma.unidade.upsert({
    where: { id: 'unidade-003' },
    update: {},
    create: {
      id: 'unidade-003',
      empresaId: empresa2.id,
      nome: 'Planta Industrial - Guarulhos',
      cidade: 'Guarulhos',
      uf: 'SP',
      responsavelTST: 'Pedro Oliveira',
      responsavelMeioAmb: 'Lucia Verde',
      status: 'ATIVO',
    },
  })

  console.log('✅ Unidades criadas')

  // ── Colaboradores ─────────────────────────────────────────────────────────
  const col1 = await prisma.colaborador.upsert({
    where: { cpf: '12345678901' },
    update: {},
    create: {
      nome: 'Roberto Ferreira',
      cpf: '12345678901',
      matricula: 'MAT001',
      unidadeId: unidade1.id,
      setor: 'Produção',
      funcao: 'Operador de Máquinas',
      admissao: new Date('2021-03-15'),
      status: 'ATIVO',
      riscos: ['Ruído', 'Vibração', 'Calor'],
    },
  })

  const col2 = await prisma.colaborador.upsert({
    where: { cpf: '98765432100' },
    update: {},
    create: {
      nome: 'Fernanda Costa',
      cpf: '98765432100',
      matricula: 'MAT002',
      unidadeId: unidade1.id,
      setor: 'Manutenção',
      funcao: 'Técnico de Manutenção',
      admissao: new Date('2020-07-01'),
      status: 'ATIVO',
      riscos: ['Elétrico', 'Mecânico'],
    },
  })

  const col3 = await prisma.colaborador.upsert({
    where: { cpf: '11122233344' },
    update: {},
    create: {
      nome: 'Marcos Santos',
      cpf: '11122233344',
      matricula: 'MAT003',
      unidadeId: unidade3.id,
      setor: 'Laboratório',
      funcao: 'Analista Químico',
      admissao: new Date('2022-01-10'),
      status: 'ATIVO',
      riscos: ['Químico', 'Biológico'],
    },
  })

  console.log('✅ Colaboradores criados')

  // ── EPIs ──────────────────────────────────────────────────────────────────
  const epi1 = await prisma.ePI.upsert({
    where: { ca: '12345' },
    update: {},
    create: {
      nome: 'Capacete de Segurança',
      ca: '12345',
      tipo: 'Proteção da Cabeça',
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const epi2 = await prisma.ePI.upsert({
    where: { ca: '23456' },
    update: {},
    create: {
      nome: 'Protetor Auricular',
      ca: '23456',
      tipo: 'Proteção Auditiva',
      validade: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.entregaEPI.createMany({
    data: [
      {
        colaboradorId: col1.id,
        epiId: epi1.id,
        dataEntrega: new Date('2024-01-15'),
        dataVencimento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        quantidade: 1,
      },
      {
        colaboradorId: col1.id,
        epiId: epi2.id,
        dataEntrega: new Date('2024-01-15'),
        dataVencimento: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        quantidade: 2,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ EPIs e entregas criadas')

  // ── ASOs ──────────────────────────────────────────────────────────────────
  await prisma.aSO.createMany({
    data: [
      {
        colaboradorId: col1.id,
        tipo: 'PERIODICO',
        dataExame: new Date('2024-06-15'),
        dataVencimento: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        resultado: 'APTO',
        medico: 'Dr. Paulo Medicina',
        crm: 'CRM-SP 123456',
      },
      {
        colaboradorId: col2.id,
        tipo: 'PERIODICO',
        dataExame: new Date('2024-03-01'),
        dataVencimento: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        resultado: 'APTO',
        medico: 'Dr. Paulo Medicina',
        crm: 'CRM-SP 123456',
      },
      {
        colaboradorId: col3.id,
        tipo: 'ADMISSIONAL',
        dataExame: new Date('2022-01-10'),
        dataVencimento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        resultado: 'APTO',
        medico: 'Dra. Carla Saúde',
        crm: 'CRM-SP 654321',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ ASOs criados')

  // ── Treinamentos ──────────────────────────────────────────────────────────
  const treinamento1 = await prisma.treinamento.upsert({
    where: { id: 'treinamento-nr35-001' },
    update: {},
    create: {
      id: 'treinamento-nr35-001',
      nome: 'NR-35 - Trabalho em Altura',
      tipo: 'NR-35',
      empresaId: empresa1.id,
      unidadeId: unidade1.id,
      dataRealizacao: new Date('2024-03-10'),
      dataVencimento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      cargaHoraria: 8,
      instrutor: 'Carlos Treinador',
    },
  })

  await prisma.treinamento.upsert({
    where: { id: 'treinamento-nr10-001' },
    update: {},
    create: {
      id: 'treinamento-nr10-001',
      nome: 'NR-10 - Segurança em Instalações Elétricas',
      tipo: 'NR-10',
      empresaId: empresa1.id,
      unidadeId: unidade1.id,
      dataRealizacao: new Date('2023-12-05'),
      dataVencimento: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      cargaHoraria: 40,
      instrutor: 'Eng. Elétrico Silva',
    },
  })

  await prisma.colaboradorTreinamento.upsert({
    where: { colaboradorId_treinamentoId: { colaboradorId: col1.id, treinamentoId: treinamento1.id } },
    update: {},
    create: { colaboradorId: col1.id, treinamentoId: treinamento1.id },
  })

  console.log('✅ Treinamentos criados')

  // ── Certificações ─────────────────────────────────────────────────────────
  await prisma.certificacao.createMany({
    data: [
      {
        tipo: 'ISO 14001',
        orgaoCertificador: 'Bureau Veritas',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        emissao: new Date('2023-05-01'),
        vencimento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        responsavel: 'Maria Ambiente',
        alertaDias: 30,
        status: 'VIGENTE',
      },
      {
        tipo: 'ISO 45001',
        orgaoCertificador: 'DNV GL',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        emissao: new Date('2022-08-15'),
        vencimento: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        responsavel: 'Carlos Segurança',
        alertaDias: 30,
        status: 'VENCIDO',
      },
      {
        tipo: 'AVCB',
        orgaoCertificador: 'Corpo de Bombeiros SP',
        empresaId: empresa2.id,
        unidadeId: unidade3.id,
        emissao: new Date('2024-01-10'),
        vencimento: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        responsavel: 'Pedro Oliveira',
        alertaDias: 60,
        status: 'VIGENTE',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Certificações criadas')

  // ── Taxas ─────────────────────────────────────────────────────────────────
  await prisma.taxa.createMany({
    data: [
      {
        tipo: 'Taxa IBAMA - CTF',
        orgao: 'IBAMA',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        competencia: '2024-01',
        vencimento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        valor: 1250.00,
        status: 'PENDENTE',
        responsavel: 'Maria Ambiente',
      },
      {
        tipo: 'Licença Ambiental Municipal',
        orgao: 'Prefeitura SP',
        empresaId: empresa1.id,
        unidadeId: unidade2.id,
        competencia: '2024-01',
        vencimento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        valor: 850.00,
        status: 'VENCIDO',
        responsavel: 'João TST',
      },
      {
        tipo: 'Taxa Ambiental Estadual',
        orgao: 'CETESB',
        empresaId: empresa2.id,
        unidadeId: unidade3.id,
        competencia: '2024-01',
        vencimento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        valor: 3200.00,
        status: 'PENDENTE',
        responsavel: 'Lucia Verde',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Taxas criadas')

  // ── Licenças Ambientais ───────────────────────────────────────────────────
  await prisma.licencaAmbiental.createMany({
    data: [
      {
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        tipo: 'LO',
        orgao: 'CETESB',
        numero: 'LO-SP-2021-001234',
        emissao: new Date('2021-03-15'),
        vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        responsavel: 'Maria Ambiente',
        status: 'VIGENTE',
      },
      {
        empresaId: empresa2.id,
        unidadeId: unidade3.id,
        tipo: 'LO',
        orgao: 'CETESB',
        numero: 'LO-SP-2020-005678',
        emissao: new Date('2020-06-01'),
        vencimento: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        responsavel: 'Lucia Verde',
        status: 'VENCIDO',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Licenças ambientais criadas')

  // ── Documentos Legais ─────────────────────────────────────────────────────
  await prisma.documentoLegal.createMany({
    data: [
      {
        nome: 'PGR 2024 - Metalúrgica Santana',
        tipo: 'PGR',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        emissao: new Date('2024-01-15'),
        vencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        responsavel: 'Carlos Segurança',
        status: 'VIGENTE',
      },
      {
        nome: 'PCMSO 2024 - Metalúrgica Santana',
        tipo: 'PCMSO',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        emissao: new Date('2024-01-15'),
        vencimento: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        responsavel: 'Dr. Paulo Medicina',
        status: 'VIGENTE',
      },
      {
        nome: 'LTCAT - Unidade Campinas',
        tipo: 'LTCAT',
        empresaId: empresa1.id,
        unidadeId: unidade2.id,
        emissao: new Date('2022-06-01'),
        vencimento: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        responsavel: 'Eng. Segurança Filho',
        status: 'VENCIDO',
      },
      {
        nome: 'Laudo de Insalubridade - Laboratório',
        tipo: 'LAUDO_INSALUBRIDADE',
        empresaId: empresa2.id,
        unidadeId: unidade3.id,
        emissao: new Date('2023-09-01'),
        vencimento: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        responsavel: 'Eng. Segurança Costa',
        status: 'VIGENTE',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Documentos legais criados')

  // ── Pendências ────────────────────────────────────────────────────────────
  await prisma.pendencia.createMany({
    data: [
      {
        descricao: 'Renovar Licença de Operação CETESB - LO vencendo em 15 dias',
        origem: 'MEIO_AMBIENTE',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        responsavelId: admin.id,
        prazo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        prioridade: 'CRITICA',
        status: 'ABERTA',
      },
      {
        descricao: 'Atualizar ASOs vencidos - colaboradores com ASO periódico expirado',
        origem: 'TST',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        responsavelId: analista.id,
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        prioridade: 'ALTA',
        status: 'EM_ANDAMENTO',
      },
      {
        descricao: 'Pagamento da taxa IBAMA-CTF com vencimento próximo',
        origem: 'TAXA',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        prazo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        prioridade: 'ALTA',
        status: 'ABERTA',
      },
      {
        descricao: 'Renovar certificação ISO 45001 - Certificado vencido há 60 dias',
        origem: 'CERTIFICACAO',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        prazo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        prioridade: 'CRITICA',
        status: 'VENCIDA',
      },
      {
        descricao: 'Treinamento NR-10 vencido - Programar retraining para técnicos de manutenção',
        origem: 'TST',
        empresaId: empresa1.id,
        unidadeId: unidade1.id,
        prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        prioridade: 'MEDIA',
        status: 'ABERTA',
      },
      {
        descricao: 'Revisão e atualização do LTCAT - Unidade Campinas',
        origem: 'DOCUMENTO_LEGAL',
        empresaId: empresa1.id,
        unidadeId: unidade2.id,
        prazo: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        prioridade: 'ALTA',
        status: 'ABERTA',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Pendências criadas')

  // ── Acidente ──────────────────────────────────────────────────────────────
  await prisma.acidente.upsert({
    where: { id: 'acidente-001' },
    update: {},
    create: {
      id: 'acidente-001',
      empresaId: empresa1.id,
      data: new Date('2024-05-20'),
      local: 'Setor de Produção - Linha 3',
      descricao: 'Colaborador sofreu corte na mão ao manusear peça metálica sem EPI adequado',
      tipologia: 'TIPICO',
      cat: true,
      numeroCat: 'CAT-2024-001234',
      investigacao: 'Investigação concluída. Causa: falta de uso de luva de proteção.',
      planoAcao: '1. Reforço no uso de EPIs\n2. Treinamento específico para manuseio de peças\n3. Revisão do procedimento operacional',
      status: 'CONCLUIDO',
    },
  })

  console.log('✅ Acidente criado')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   Credenciais de acesso:')
  console.log('   Admin:    admin@gestaotst.com.br / admin123')
  console.log('   Analista: analista@gestaotst.com.br / analista123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
