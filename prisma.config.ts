// @ts-nocheck
// Prisma v7 — 'datasource', 'migrations' e 'earlyAccess' estão em early access,
// os tipos ainda não são totalmente expostos mas funcionam em runtime.
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),

  // URL do banco lida do .env — para DDL usa DIRECT_URL (sem pgbouncer)
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },

  // Seed oficial do Prisma v7 (substitui a chave "prisma.seed" do package.json)
  migrations: {
    seed: 'ts-node --require dotenv/config --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
})
