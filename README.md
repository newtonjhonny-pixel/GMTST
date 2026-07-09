# GestãoTST — Sistema de Gestão de TST e Meio Ambiente

Sistema web para controle de Saúde e Segurança do Trabalho (TST), Meio Ambiente, certificações, licenças, taxas, documentos legais, vencimentos e planos de ação.

## Infraestrutura Oficial

O GestãoTST segue o padrão oficial da NEVION:

- Hostinger VPS Ubuntu
- Docker e Docker Compose
- PostgreSQL interno da VPS
- Prisma ORM com migrations versionadas
- Nginx Proxy Manager
- SSL Let's Encrypt
- GitHub apenas como repositório/versionamento

Domínio oficial:

```text
https://gestaotst.nevion.com.br
```

## Tecnologias

- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4
- Backend: Next.js API Routes
- Banco de dados: PostgreSQL interno
- ORM: Prisma v7
- Autenticação: NextAuth v5
- IA: Claude API (Anthropic), opcional
- Gráficos: Recharts e ApexCharts
- Exportação: jsPDF e xlsx

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Dashboard | Indicadores executivos e vencimentos |
| Empresas e Unidades | Cadastro e visão operacional |
| Colaboradores | Dados ocupacionais e vínculos |
| SST | PGR, PCMSO, LTCAT, PPP, ASO, EPI, treinamentos, acidentes, inspeções e AVCB |
| Meio Ambiente | Licenças, condicionantes, IBAMA/CTF/RAPP, resíduos, produtos químicos e monitoramentos |
| Certificações | Gestão de certificações e vencimentos |
| Taxas | Controle de taxas e pagamentos |
| Documentos Legais | Controle de documentos legais e anexos |
| Pendências | Plano de ação com prioridades e responsáveis |
| Relatórios | Exportação PDF e Excel |
| Auditoria | Histórico de eventos do sistema |
| Administração | Usuários e perfis |

## Estrutura Local

```text
D:\Projetos\GestaoTST
├── prisma
├── public
├── scripts
├── src
├── package.json
├── package-lock.json
├── prisma.config.ts
└── README.md
```

## Estrutura De Produção

```text
/opt/njsistemas/apps/gestaotst
├── source
├── logs
├── storage
├── backups
├── prisma
├── Dockerfile
├── docker-compose.prod.yml
└── .env
```

## Variáveis Principais

Os exemplos oficiais ficam em `.env.example` e `.env.production.example`.

Valores esperados em produção:

```env
NEXTAUTH_URL=https://gestaotst.nevion.com.br
AUTH_URL=https://gestaotst.nevion.com.br
NEXT_PUBLIC_APP_URL=https://gestaotst.nevion.com.br
NEXT_PUBLIC_APP_NAME=GestãoTST
MAIL_FROM=GestãoTST <noreply@nevion.com.br>
DATABASE_URL=postgresql://gestaotst_user:SENHA_FORTE@njsistemas-postgres:5432/gestaotst_prod?schema=public
DIRECT_URL=postgresql://gestaotst_user:SENHA_FORTE@njsistemas-postgres:5432/gestaotst_prod?schema=public
```

## Comandos Locais

```powershell
npm install
npm run lint
npx tsc --noEmit
npm run build
npx prisma validate
npx prisma generate
```

## Deploy

O deploy oficial deve ser feito exclusivamente via Docker na VPS da NEVION.

Em produção, aplicar banco somente com:

```bash
npx prisma migrate deploy
```

Nunca usar em produção:

```bash
prisma db push
prisma migrate reset
```

## Credenciais Iniciais

As credenciais iniciais são criadas pelo seed/setup conforme configuração segura do ambiente.

Após o primeiro acesso, a senha inicial deve ser alterada imediatamente.

## Notas Técnicas

- O Prisma Client é gerado com `npx prisma generate`.
- O projeto deve manter migrations versionadas antes do deploy.
- O Nginx Proxy Manager deve expor apenas `gestaotst.nevion.com.br`.
- Não há compatibilidade oficial com domínio antigo.
