-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRADOR', 'GERENTE', 'COORDENADOR', 'ANALISTA_TST', 'ANALISTA_MEIO_AMBIENTE', 'CONSULTA');

-- CreateEnum
CREATE TYPE "StatusGeral" AS ENUM ('ATIVO', 'INATIVO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "StatusColaborador" AS ENUM ('ATIVO', 'INATIVO', 'DEMITIDO', 'AFASTADO');

-- CreateEnum
CREATE TYPE "TipoASO" AS ENUM ('ADMISSIONAL', 'PERIODICO', 'RETORNO', 'MUDANCA_RISCO', 'DEMISSIONAL');

-- CreateEnum
CREATE TYPE "ResultadoASO" AS ENUM ('APTO', 'INAPTO', 'APTO_COM_RESTRICAO');

-- CreateEnum
CREATE TYPE "TipoAcidente" AS ENUM ('TIPICO', 'TRAJETO', 'DOENCA_OCUPACIONAL');

-- CreateEnum
CREATE TYPE "StatusAcidente" AS ENUM ('ABERTO', 'EM_INVESTIGACAO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "StatusInspecao" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "TipoLicenca" AS ENUM ('LP', 'LI', 'LO', 'LAS', 'OUTORGA', 'CTF_IBAMA', 'AUTORIZACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusCondicionante" AS ENUM ('PENDENTE', 'EM_DIA', 'ATRASADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "TipoMonitoramento" AS ENUM ('EFLUENTE_LIQUIDO', 'EMISSAO_ATMOSFERICA', 'RUIDO_AMBIENTAL', 'AGUA_SUBTERRANEA', 'SOLO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusDocumento" AS ENUM ('VIGENTE', 'VENCIDO', 'A_VENCER', 'CANCELADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "StatusTaxa" AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoDocumentoLegal" AS ENUM ('PGR', 'PCMSO', 'LTCAT', 'PPP', 'LAUDO_INSALUBRIDADE', 'LAUDO_PERICULOSIDADE', 'LAUDO_ERGONOMICO', 'LICENCA_AMBIENTAL', 'CERTIDAO_NEGATIVA', 'CTF_APP_IBAMA', 'AVCB', 'ALVARA', 'OUTRO');

-- CreateEnum
CREATE TYPE "OrigemPendencia" AS ENUM ('TST', 'MEIO_AMBIENTE', 'CERTIFICACAO', 'TAXA', 'AUDITORIA', 'DOCUMENTO_LEGAL');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "StatusPendencia" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'VENCIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoRisco" AS ENUM ('FISICO', 'QUIMICO', 'BIOLOGICO', 'ERGONOMICO', 'ACIDENTE');

-- CreateEnum
CREATE TYPE "StatusRisco" AS ENUM ('IDENTIFICADO', 'AVALIADO', 'CONTROLADO');

-- CreateEnum
CREATE TYPE "TipoLIP" AS ENUM ('INSALUBRIDADE', 'PERICULOSIDADE', 'AMBOS');

-- CreateEnum
CREATE TYPE "TipoComunicacao" AS ENUM ('DSSMA', 'PALESTRA', 'INFORMATIVO', 'CAMPANHA', 'REUNIAO_SST');

-- CreateEnum
CREATE TYPE "TipoExtintor" AS ENUM ('AGUA', 'PO_ABC', 'PO_BC', 'CO2', 'ESPUMA', 'HALONADO');

-- CreateEnum
CREATE TYPE "TipoEquipPressao" AS ENUM ('VASO_PRESSAO', 'CALDEIRA', 'COMPRESSOR', 'TUBULACAO');

-- CreateEnum
CREATE TYPE "TipoMovEstoque" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('ABERTA', 'APROVADA', 'REPROVADA', 'COMPRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "CargoCipaa" AS ENUM ('PRESIDENTE', 'VICE_PRESIDENTE', 'SECRETARIO', 'MEMBRO_EFETIVO', 'MEMBRO_SUPLENTE');

-- CreateEnum
CREATE TYPE "RepresentacaoCipaa" AS ENUM ('EMPREGADO', 'EMPREGADOR');

-- CreateEnum
CREATE TYPE "TipoReuniaoCipaa" AS ENUM ('ORDINARIA', 'EXTRAORDINARIA');

-- CreateEnum
CREATE TYPE "MaterialColetaSeletiva" AS ENUM ('PAPEL', 'PLASTICO', 'VIDRO', 'METAL', 'ORGANICO', 'REJEITO', 'ELETRONICO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoRecursoHidrico" AS ENUM ('OUTORGA_CAPTACAO', 'OUTORGA_LANCAMENTO', 'POCO_ARTESIANO', 'EFLUENTE_TRATADO', 'AGUA_REUSO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ANALISTA_TST',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "responsavelTST" TEXT,
    "responsavelMeioAmb" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "matricula" TEXT,
    "unidadeId" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "admissao" TIMESTAMP(3) NOT NULL,
    "status" "StatusColaborador" NOT NULL DEFAULT 'ATIVO',
    "riscos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EPI" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ca" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "validade" TIMESTAMP(3),
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntregaEPI" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "epiId" TEXT NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "anexo" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntregaEPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ASO" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "tipo" "TipoASO" NOT NULL,
    "dataExame" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "resultado" "ResultadoASO" NOT NULL DEFAULT 'APTO',
    "medico" TEXT,
    "crm" TEXT,
    "anexo" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ASO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treinamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "normaRegulamentadora" TEXT,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "dataRealizacao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "cargaHoraria" DOUBLE PRECISION,
    "instrutor" TEXT,
    "local" TEXT,
    "anexo" TEXT,
    "observacao" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treinamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaboradorTreinamento" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "treinamentoId" TEXT NOT NULL,

    CONSTRAINT "ColaboradorTreinamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acidente" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipologia" "TipoAcidente" NOT NULL,
    "cat" BOOLEAN NOT NULL DEFAULT false,
    "numeroCat" TEXT,
    "dataCat" TIMESTAMP(3),
    "eSocial" BOOLEAN NOT NULL DEFAULT false,
    "eSocialProtocolo" TEXT,
    "diasPerdidos" INTEGER,
    "investigacao" TEXT,
    "planoAcao" TEXT,
    "anexo" TEXT,
    "status" "StatusAcidente" NOT NULL DEFAULT 'ABERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Acidente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspecaoSeguranca" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataInspecao" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT NOT NULL,
    "resultado" TEXT,
    "naoConformidades" TEXT,
    "anexo" TEXT,
    "status" "StatusInspecao" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspecaoSeguranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicencaAmbiental" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "tipo" "TipoLicenca" NOT NULL,
    "orgao" TEXT NOT NULL,
    "numero" TEXT,
    "emissao" TIMESTAMP(3),
    "vencimento" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT,
    "condicionantes" TEXT,
    "anexo" TEXT,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicencaAmbiental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControleResiduo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "unidadeId" TEXT,
    "descricao" TEXT NOT NULL,
    "codigoIBAMA" TEXT,
    "classeRisco" TEXT,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "dataGeracao" TIMESTAMP(3) NOT NULL,
    "destinacao" TEXT NOT NULL,
    "empresaColetora" TEXT,
    "mtr" TEXT,
    "certificadoDest" TEXT,
    "anexo" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControleResiduo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoQuimico" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "nome" TEXT NOT NULL,
    "cas" TEXT,
    "fornecedor" TEXT,
    "fispq" TEXT,
    "riscos" TEXT[],
    "armazenagem" TEXT,
    "epi" TEXT[],
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoQuimico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatorioAmbiental" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "orgao" TEXT,
    "dataEnvio" TIMESTAMP(3),
    "prazo" TIMESTAMP(3),
    "responsavel" TEXT,
    "anexo" TEXT,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatorioAmbiental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condicionante" (
    "id" TEXT NOT NULL,
    "licencaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prazo" TIMESTAMP(3),
    "periodicidade" TEXT,
    "responsavel" TEXT,
    "evidencia" TEXT,
    "status" "StatusCondicionante" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condicionante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroIBAMA" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT,
    "numeroCTF" TEXT,
    "certificadoReg" TEXT,
    "validadeCR" TIMESTAMP(3),
    "periodoRAPP" TEXT,
    "dataEnvioRAPP" TIMESTAMP(3),
    "protocolo" TEXT,
    "responsavel" TEXT,
    "observacao" TEXT,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroIBAMA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoramentoAmbiental" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "tipo" "TipoMonitoramento" NOT NULL,
    "parametro" TEXT NOT NULL,
    "resultado" TEXT,
    "unidadeMedida" TEXT,
    "limitePermitido" TEXT,
    "conformidade" BOOLEAN,
    "dataColeta" TIMESTAMP(3) NOT NULL,
    "dataProxima" TIMESTAMP(3),
    "laboratorio" TEXT,
    "responsavel" TEXT,
    "anexo" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoramentoAmbiental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificacao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "orgaoCertificador" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "emissao" TIMESTAMP(3),
    "vencimento" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT,
    "anexo" TEXT,
    "alertaDias" INTEGER NOT NULL DEFAULT 30,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxa" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "orgao" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "competencia" TEXT,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(65,30),
    "status" "StatusTaxa" NOT NULL DEFAULT 'PENDENTE',
    "comprovante" TEXT,
    "responsavel" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoLegal" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoDocumentoLegal" NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "emissao" TIMESTAMP(3),
    "vencimento" TIMESTAMP(3),
    "responsavel" TEXT,
    "anexo" TEXT,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoLegal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendencia" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "origem" "OrigemPendencia" NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT,
    "responsavelId" TEXT,
    "prazo" TIMESTAMP(3) NOT NULL,
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusPendencia" NOT NULL DEFAULT 'ABERTA',
    "evidencia" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historico" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGR" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataRevisao" TIMESTAMP(3),
    "responsavelTecnico" TEXT NOT NULL,
    "crea" TEXT,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "anexos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PGR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGRRevisao" (
    "id" TEXT NOT NULL,
    "pgrId" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "dataRevisao" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "responsavel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PGRRevisao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PCMSO" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "medicoResponsavel" TEXT NOT NULL,
    "crm" TEXT,
    "clinica" TEXT,
    "vigenciaInicial" TIMESTAMP(3) NOT NULL,
    "vigenciaFinal" TIMESTAMP(3),
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "anexos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PCMSO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamePrevisto" (
    "id" TEXT NOT NULL,
    "pcmsoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "periodicidade" TEXT NOT NULL,
    "funcoes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamePrevisto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LTCAT" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "responsavelTecnico" TEXT NOT NULL,
    "crea" TEXT,
    "art" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "vigencia" TIMESTAMP(3),
    "ambientesAvaliados" TEXT,
    "agentesNocivos" TEXT[],
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "anexos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LTCAT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPP" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "historico" TEXT,
    "agentesNocivos" TEXT[],
    "responsavel" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PPP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioRisco" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "pgrId" TEXT,
    "ghe" TEXT NOT NULL,
    "atividade" TEXT NOT NULL,
    "agente" TEXT NOT NULL,
    "tipoRisco" "TipoRisco" NOT NULL,
    "fontePorVia" TEXT,
    "nivelAcao" TEXT,
    "limiteTolerancia" TEXT,
    "medicaoRealizada" TEXT,
    "medidasControle" TEXT,
    "epc" TEXT,
    "epi" TEXT,
    "responsavel" TEXT,
    "status" "StatusRisco" NOT NULL DEFAULT 'IDENTIFICADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventarioRisco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AET" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "responsavelTecnico" TEXT NOT NULL,
    "crea" TEXT,
    "art" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "vigencia" TIMESTAMP(3),
    "setoresAvaliados" TEXT,
    "atividades" TEXT[],
    "fatoresErgonomicos" TEXT[],
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "anexos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AET_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LIP" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "tipo" "TipoLIP" NOT NULL,
    "responsavelTecnico" TEXT NOT NULL,
    "crea" TEXT,
    "art" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "vigencia" TIMESTAMP(3),
    "setoresAvaliados" TEXT,
    "agentes" TEXT[],
    "grau" TEXT,
    "adicionalPercent" DOUBLE PRECISION,
    "status" "StatusDocumento" NOT NULL DEFAULT 'VIGENTE',
    "observacao" TEXT,
    "anexos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LIP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComunicacaoSST" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT,
    "tipo" "TipoComunicacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT,
    "responsavel" TEXT,
    "duracao" INTEGER,
    "participantes" INTEGER,
    "conteudo" TEXT,
    "anexo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComunicacaoSST_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DireitoRecusa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricaoRisco" TEXT NOT NULL,
    "motivoRecusa" TEXT NOT NULL,
    "providencias" TEXT,
    "responsavel" TEXT,
    "resolvido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DireitoRecusa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extintor" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoExtintor" NOT NULL,
    "capacidade" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "setor" TEXT,
    "fabricacao" TIMESTAMP(3),
    "ultimaRecarga" TIMESTAMP(3),
    "proximaRecarga" TIMESTAMP(3) NOT NULL,
    "ultimaInspecao" TIMESTAMP(3),
    "proximaInspecao" TIMESTAMP(3) NOT NULL,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extintor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipamentoPressao" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "tipo" "TipoEquipPressao" NOT NULL,
    "tag" TEXT NOT NULL,
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "pressaoMaxima" DOUBLE PRECISION,
    "volumeInterno" DOUBLE PRECISION,
    "fluido" TEXT,
    "localizacao" TEXT,
    "dataFabricacao" TIMESTAMP(3),
    "ultimaInspecao" TIMESTAMP(3),
    "proximaInspecao" TIMESTAMP(3),
    "art" TEXT,
    "responsavelTecnico" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipamentoPressao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueEPI" (
    "id" TEXT NOT NULL,
    "epiId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "TipoMovEstoque" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "dataMovimento" TIMESTAMP(3) NOT NULL,
    "fornecedor" TEXT,
    "notaFiscal" TEXT,
    "responsavel" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstoqueEPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoCompraEPI" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "epiId" TEXT,
    "descricaoEPI" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "justificativa" TEXT,
    "solicitante" TEXT NOT NULL,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL,
    "prazoNecessario" TIMESTAMP(3),
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'ABERTA',
    "aprovadoPor" TEXT,
    "dataAprovacao" TIMESTAMP(3),
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitacaoCompraEPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "colaboradorId" TEXT,
    "setor" TEXT,
    "funcao" TEXT,
    "riscos" TEXT[],
    "epis" TEXT[],
    "medidasControle" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataRevisao" TIMESTAMP(3),
    "responsavel" TEXT,
    "assinado" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cipaa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "mandatoInicio" TIMESTAMP(3) NOT NULL,
    "mandatoFim" TIMESTAMP(3) NOT NULL,
    "numeroEdital" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cipaa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroCipaa" (
    "id" TEXT NOT NULL,
    "cipaId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "cargo" "CargoCipaa" NOT NULL,
    "representacao" "RepresentacaoCipaa" NOT NULL,
    "dataPosse" TIMESTAMP(3),
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembroCipaa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReuniaoCipaa" (
    "id" TEXT NOT NULL,
    "cipaId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoReuniaoCipaa" NOT NULL DEFAULT 'ORDINARIA',
    "local" TEXT,
    "pauta" TEXT,
    "ata" TEXT,
    "presentes" TEXT[],
    "aprovada" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReuniaoCipaa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoCipaa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "dataCurso" TIMESTAMP(3) NOT NULL,
    "cargaHoraria" INTEGER,
    "instrutor" TEXT,
    "instituicao" TEXT,
    "validade" TIMESTAMP(3),
    "certificado" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursoCipaa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGRSAmbiental" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "dataElaboracao" TIMESTAMP(3) NOT NULL,
    "dataVigencia" TIMESTAMP(3) NOT NULL,
    "dataRevisao" TIMESTAMP(3),
    "responsavel" TEXT,
    "consultor" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PGRSAmbiental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresaColetora" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "responsavel" TEXT,
    "licencaAmbiental" TEXT,
    "validadeLicenca" TIMESTAMP(3),
    "tiposResiduos" TEXT[],
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpresaColetora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificadoDestinacao" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "coletorId" TEXT NOT NULL,
    "numero" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "tiposResiduos" TEXT[],
    "quantidadeTotal" DOUBLE PRECISION,
    "unidadeMedida" TEXT,
    "formaDestinacao" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificadoDestinacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColetaSeletiva" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "material" "MaterialColetaSeletiva" NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'kg',
    "destinacao" TEXT,
    "coletorId" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColetaSeletiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecursoHidrico" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "tipo" "TipoRecursoHidrico" NOT NULL,
    "numeroOutorga" TEXT,
    "orgaoOtorgante" TEXT,
    "emissao" TIMESTAMP(3),
    "vencimento" TIMESTAMP(3),
    "vazaoAutorizada" DOUBLE PRECISION,
    "unidadeMedida" TEXT,
    "finalidade" TEXT,
    "responsavel" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecursoHidrico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3),
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_codigo_key" ON "Empresa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_cpf_key" ON "Colaborador"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "EPI_ca_key" ON "EPI"("ca");

-- CreateIndex
CREATE UNIQUE INDEX "ColaboradorTreinamento_colaboradorId_treinamentoId_key" ON "ColaboradorTreinamento"("colaboradorId", "treinamentoId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unidade" ADD CONSTRAINT "Unidade_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaEPI" ADD CONSTRAINT "EntregaEPI_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaEPI" ADD CONSTRAINT "EntregaEPI_epiId_fkey" FOREIGN KEY ("epiId") REFERENCES "EPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASO" ADD CONSTRAINT "ASO_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treinamento" ADD CONSTRAINT "Treinamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treinamento" ADD CONSTRAINT "Treinamento_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorTreinamento" ADD CONSTRAINT "ColaboradorTreinamento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorTreinamento" ADD CONSTRAINT "ColaboradorTreinamento_treinamentoId_fkey" FOREIGN KEY ("treinamentoId") REFERENCES "Treinamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acidente" ADD CONSTRAINT "Acidente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspecaoSeguranca" ADD CONSTRAINT "InspecaoSeguranca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspecaoSeguranca" ADD CONSTRAINT "InspecaoSeguranca_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicencaAmbiental" ADD CONSTRAINT "LicencaAmbiental_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicencaAmbiental" ADD CONSTRAINT "LicencaAmbiental_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControleResiduo" ADD CONSTRAINT "ControleResiduo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControleResiduo" ADD CONSTRAINT "ControleResiduo_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoQuimico" ADD CONSTRAINT "ProdutoQuimico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condicionante" ADD CONSTRAINT "Condicionante_licencaId_fkey" FOREIGN KEY ("licencaId") REFERENCES "LicencaAmbiental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroIBAMA" ADD CONSTRAINT "RegistroIBAMA_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroIBAMA" ADD CONSTRAINT "RegistroIBAMA_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoramentoAmbiental" ADD CONSTRAINT "MonitoramentoAmbiental_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoramentoAmbiental" ADD CONSTRAINT "MonitoramentoAmbiental_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificacao" ADD CONSTRAINT "Certificacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificacao" ADD CONSTRAINT "Certificacao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxa" ADD CONSTRAINT "Taxa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxa" ADD CONSTRAINT "Taxa_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoLegal" ADD CONSTRAINT "DocumentoLegal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoLegal" ADD CONSTRAINT "DocumentoLegal_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendencia" ADD CONSTRAINT "Pendencia_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historico" ADD CONSTRAINT "Historico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGR" ADD CONSTRAINT "PGR_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGR" ADD CONSTRAINT "PGR_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGRRevisao" ADD CONSTRAINT "PGRRevisao_pgrId_fkey" FOREIGN KEY ("pgrId") REFERENCES "PGR"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PCMSO" ADD CONSTRAINT "PCMSO_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PCMSO" ADD CONSTRAINT "PCMSO_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamePrevisto" ADD CONSTRAINT "ExamePrevisto_pcmsoId_fkey" FOREIGN KEY ("pcmsoId") REFERENCES "PCMSO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LTCAT" ADD CONSTRAINT "LTCAT_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LTCAT" ADD CONSTRAINT "LTCAT_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPP" ADD CONSTRAINT "PPP_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPP" ADD CONSTRAINT "PPP_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPP" ADD CONSTRAINT "PPP_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioRisco" ADD CONSTRAINT "InventarioRisco_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioRisco" ADD CONSTRAINT "InventarioRisco_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioRisco" ADD CONSTRAINT "InventarioRisco_pgrId_fkey" FOREIGN KEY ("pgrId") REFERENCES "PGR"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AET" ADD CONSTRAINT "AET_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AET" ADD CONSTRAINT "AET_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LIP" ADD CONSTRAINT "LIP_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LIP" ADD CONSTRAINT "LIP_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicacaoSST" ADD CONSTRAINT "ComunicacaoSST_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComunicacaoSST" ADD CONSTRAINT "ComunicacaoSST_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoRecusa" ADD CONSTRAINT "DireitoRecusa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoRecusa" ADD CONSTRAINT "DireitoRecusa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extintor" ADD CONSTRAINT "Extintor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extintor" ADD CONSTRAINT "Extintor_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipamentoPressao" ADD CONSTRAINT "EquipamentoPressao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipamentoPressao" ADD CONSTRAINT "EquipamentoPressao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueEPI" ADD CONSTRAINT "EstoqueEPI_epiId_fkey" FOREIGN KEY ("epiId") REFERENCES "EPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueEPI" ADD CONSTRAINT "EstoqueEPI_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoCompraEPI" ADD CONSTRAINT "SolicitacaoCompraEPI_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoCompraEPI" ADD CONSTRAINT "SolicitacaoCompraEPI_epiId_fkey" FOREIGN KEY ("epiId") REFERENCES "EPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cipaa" ADD CONSTRAINT "Cipaa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cipaa" ADD CONSTRAINT "Cipaa_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroCipaa" ADD CONSTRAINT "MembroCipaa_cipaId_fkey" FOREIGN KEY ("cipaId") REFERENCES "Cipaa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroCipaa" ADD CONSTRAINT "MembroCipaa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReuniaoCipaa" ADD CONSTRAINT "ReuniaoCipaa_cipaId_fkey" FOREIGN KEY ("cipaId") REFERENCES "Cipaa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReuniaoCipaa" ADD CONSTRAINT "ReuniaoCipaa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoCipaa" ADD CONSTRAINT "CursoCipaa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoCipaa" ADD CONSTRAINT "CursoCipaa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGRSAmbiental" ADD CONSTRAINT "PGRSAmbiental_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGRSAmbiental" ADD CONSTRAINT "PGRSAmbiental_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoDestinacao" ADD CONSTRAINT "CertificadoDestinacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoDestinacao" ADD CONSTRAINT "CertificadoDestinacao_coletorId_fkey" FOREIGN KEY ("coletorId") REFERENCES "EmpresaColetora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColetaSeletiva" ADD CONSTRAINT "ColetaSeletiva_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColetaSeletiva" ADD CONSTRAINT "ColetaSeletiva_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColetaSeletiva" ADD CONSTRAINT "ColetaSeletiva_coletorId_fkey" FOREIGN KEY ("coletorId") REFERENCES "EmpresaColetora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidrico" ADD CONSTRAINT "RecursoHidrico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidrico" ADD CONSTRAINT "RecursoHidrico_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
