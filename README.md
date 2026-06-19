# GMTST — Sistema de Gestão de TST e Meio Ambiente

Sistema web completo para controle de Saúde e Segurança do Trabalho (TST) e Meio Ambiente, com gestão de certificações, licenças, taxas, documentos legais, vencimentos e planos de ação.

## Tecnologias

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Next.js API Routes, Prisma ORM v7
- **Banco de dados:** PostgreSQL 14+
- **Autenticação:** NextAuth v5 (e-mail + senha, JWT)
- **IA:** Claude API (Anthropic) — opcional
- **Gráficos:** Recharts
- **Exportação:** jsPDF, xlsx

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Dashboard | Indicadores em tempo real |
| Empresas e Unidades | Cadastro completo |
| Colaboradores | Dados e vínculos |
| TST | EPIs, ASOs, Treinamentos, Acidentes, Inspeções |
| Meio Ambiente | Licenças, Resíduos, Produtos Químicos, Relatórios |
| Certificações | ISO 14001, ISO 45001, AVCB, etc. |
| Taxas | IBAMA, CETESB, municipais, etc. |
| Documentos Legais | PGR, PCMSO, LTCAT, Laudos, etc. |
| Pendências | Plano de ação com prioridades |
| Relatórios | PDF e Excel |
| Agente de IA | Assistente inteligente |
| Controle de Acesso | Perfis e permissões |

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## Instalação e primeira execução

### 1. Crie o banco de dados no PostgreSQL

```sql
CREATE DATABASE gmtst;
```

### 2. Configure a variável de ambiente

Edite o arquivo `.env` na raiz do projeto (`D:\projetos\GMTST\.env`):

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/gmtst"

NEXTAUTH_SECRET="gmtst-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="gmtst-secret-key-change-in-production-2024"

# Opcional — necessário para o Agente de IA
ANTHROPIC_API_KEY=""
```

### 3. Acesse a pasta do projeto

```powershell
cd D:\projetos\GMTST
```

### 4. Aplique o schema ao banco de dados

```powershell
npx prisma db push --url="postgresql://postgres:SUA_SENHA@localhost:5432/gmtst"
```

### 5. Popule o banco com dados iniciais (seed)

O seed cria automaticamente o usuário administrador e dados de exemplo:

```powershell
npx prisma db seed
```

> **O seed é idempotente** — pode ser executado várias vezes sem duplicar dados.  
> Usuários, EPIs e acidentes usam `upsert`; registros com `createMany` usam `skipDuplicates: true`.

### 6. Inicie o servidor

```powershell
npm run dev
```

Acesse: **http://localhost:3000**

---

## Credenciais de acesso (criadas pelo seed)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@gmtst.com | admin123 | Administrador |
| analista@gmtst.com | analista123 | Analista TST |

---

## Estrutura do Projeto

```
D:\projetos\GMTST\
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── seed.ts             # Dados iniciais + usuário admin
├── src/
│   ├── app/
│   │   ├── (auth)/login/   # Página de login
│   │   ├── (protected)/    # Páginas protegidas (requerem login)
│   │   │   ├── dashboard/
│   │   │   ├── empresas/
│   │   │   ├── colaboradores/
│   │   │   ├── tst/        # EPIs · ASOs · Treinamentos · Acidentes · Inspeções
│   │   │   ├── meio-ambiente/ # Licenças · Resíduos · Produtos · Relatórios
│   │   │   ├── certificacoes/
│   │   │   ├── taxas/
│   │   │   ├── documentos/
│   │   │   ├── pendencias/
│   │   │   ├── relatorios/
│   │   │   ├── agente-ia/
│   │   │   └── admin/usuarios/
│   │   └── api/
│   │       ├── auth/       # NextAuth handlers
│   │       ├── agente/     # Agente de IA (Claude)
│   │       └── setup/      # Criação manual do admin (apoio)
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, PageHeader
│   │   └── ui/             # Componentes reutilizáveis
│   ├── lib/
│   │   ├── auth.ts         # Configuração NextAuth (JWT + Credentials)
│   │   ├── prisma.ts       # Cliente Prisma com PrismaPg adapter
│   │   └── utils.ts        # Utilitários de formatação
│   └── proxy.ts            # Proteção de rotas (Next.js 16)
├── .env                    # Variáveis de ambiente
├── prisma.config.ts        # Configuração do Prisma v7
└── package.json
```

---

## Comandos úteis

```powershell
npm run dev                 # Servidor de desenvolvimento (porta 3000)
npm run build               # Build de produção
npm run start               # Servidor de produção
npx prisma db seed          # Rodar seed (cria admin + dados de exemplo)
npx prisma studio           # Interface visual do banco
npx prisma generate         # Regenerar Prisma Client
```

---

## Rota de apoio: /api/setup

A rota `GET /api/setup` cria ou corrige o usuário administrador diretamente no banco, sem precisar rodar o seed. Use apenas se o seed não puder ser executado:

```
http://localhost:3000/api/setup
```

---

## Agente de IA

O módulo usa a API da Anthropic (Claude Haiku). Para ativar:

1. Acesse [console.anthropic.com](https://console.anthropic.com) e gere uma API Key
2. Adicione ao `.env`: `ANTHROPIC_API_KEY="sk-ant-..."`

Sem a API Key, o sistema usa respostas automáticas baseadas nos dados reais do banco.

---

## Perfis de acesso

| Perfil | Nível |
|--------|-------|
| Administrador | Acesso total |
| Gerente | Leitura e escrita em todos os módulos |
| Coordenador | Leitura e escrita por área |
| Analista TST | TST e Colaboradores |
| Analista Meio Ambiente | Meio Ambiente |
| Consulta | Somente leitura |

---

## Notas técnicas

- **Prisma v7**: usa `PrismaPg` adapter — o `DATABASE_URL` não fica mais no `datasource` do schema, mas é lido via `process.env.DATABASE_URL` no adapter.
- **NextAuth v5**: autenticação por JWT + Credentials sem `PrismaAdapter` (incompatível com essa combinação).
- **Next.js 16**: proteção de rotas usa `src/proxy.ts` (renomeado de `middleware.ts`).
