// Script único de migração: agrupa EntregaEPI antigas (sem fichaId) em FichaEntregaEPI por colaborador.
// Não apaga nem altera o conteúdo de nenhum registro existente — apenas cria a ficha e vincula o item via fichaId.
import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL não definida.')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🔄 Migrando EntregaEPI órfãs para FichaEntregaEPI...')

  const orfas = await prisma.entregaEPI.findMany({
    where: { fichaId: null },
    include: { colaborador: { include: { unidade: true } } },
    orderBy: { dataEntrega: 'asc' },
  })

  if (orfas.length === 0) {
    console.log('✅ Nenhuma entrega órfã encontrada. Nada a migrar.')
    return
  }

  const porColaborador = new Map<string, typeof orfas>()
  for (const item of orfas) {
    const lista = porColaborador.get(item.colaboradorId) ?? []
    lista.push(item)
    porColaborador.set(item.colaboradorId, lista)
  }

  let fichasCriadas = 0
  let itensVinculados = 0

  for (const [colaboradorId, itens] of porColaborador) {
    const primeiro = itens[0]
    const unidade = primeiro.colaborador.unidade

    const ficha = await prisma.fichaEntregaEPI.create({
      data: {
        colaboradorId,
        empresaId: unidade.empresaId,
        unidadeId: unidade.id,
        dataEntrega: primeiro.dataEntrega,
        observacao: 'Ficha gerada automaticamente a partir de entregas registradas antes da reorganização do módulo.',
        status: 'ATIVA',
      },
    })
    fichasCriadas++

    await prisma.entregaEPI.updateMany({
      where: { id: { in: itens.map(i => i.id) } },
      data: { fichaId: ficha.id },
    })
    itensVinculados += itens.length

    console.log(`   → Ficha ${ficha.id} criada para colaborador ${colaboradorId} (${itens.length} item(ns))`)
  }

  console.log(`\n✅ Migração concluída: ${fichasCriadas} ficha(s) criada(s), ${itensVinculados} item(ns) vinculado(s).`)
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
