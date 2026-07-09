import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

const TIPO_LABEL: Record<string, string> = {
  EFLUENTE_LIQUIDO:    'Efluente Líquido',
  EMISSAO_ATMOSFERICA: 'Emissão Atmosférica',
  RUIDO_AMBIENTAL:     'Ruído Ambiental',
  AGUA_SUBTERRANEA:    'Água Subterrânea',
  SOLO:                'Solo',
  OUTRO:               'Outro',
}

const TIPO_COLOR: Record<string, { bg: string; text: string }> = {
  EFLUENTE_LIQUIDO:    { bg: '#eff6ff', text: '#2563eb' },
  EMISSAO_ATMOSFERICA: { bg: '#fef3c7', text: '#92400e' },
  RUIDO_AMBIENTAL:     { bg: '#fdf4ff', text: '#7c3aed' },
  AGUA_SUBTERRANEA:    { bg: '#ecfeff', text: '#0e7490' },
  SOLO:                { bg: '#f0fdf4', text: '#16a34a' },
  OUTRO:               { bg: '#f1f5f9', text: '#475569' },
}

const COLS = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'tipo', label: 'Tipo', width: '150px' },
  { key: 'parametro', label: 'Parâmetro' },
  { key: 'resultado', label: 'Resultado', width: '100px' },
  { key: 'limite', label: 'Limite', width: '100px' },
  { key: 'conformidade', label: 'Conform.', width: '90px' },
  { key: 'coleta', label: 'Coleta', width: '100px' },
  { key: 'proxima', label: 'Próxima', width: '100px' },
  { key: 'acoes', label: '', width: '50px' },
]

export default async function MonitoramentosPage() {
  const itens = await prisma.monitoramentoAmbiental.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { dataColeta: 'desc' },
  })

  const naoConformes = itens.filter(i => i.conformidade === false).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Monitoramentos Ambientais
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {itens.length} registro{itens.length !== 1 ? 's' : ''} · Emissões, efluentes e parâmetros ambientais
            {naoConformes > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {naoConformes} não conforme{naoConformes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/meio-ambiente/monitoramentos/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Monitoramento
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={itens.length} empty={{ icon: '📊', message: 'Nenhum monitoramento registrado' }}>
        {itens.map(item => {
          const tc = TIPO_COLOR[item.tipo] ?? TIPO_COLOR.OUTRO
          const dias = diasPara(item.dataProxima)
          const vencendo = dias !== null && dias >= 0 && dias <= 15
          return (
            <Tr key={item.id}>
              <Td bold>{item.empresa.razaoSocial}</Td>
              <Td muted>{item.unidade.nome}</Td>
              <Td>
                <Pill color={tc.text} bg={tc.bg}>{TIPO_LABEL[item.tipo] ?? item.tipo}</Pill>
              </Td>
              <Td bold>{item.parametro}</Td>
              <Td mono>{item.resultado ? `${item.resultado} ${item.unidadeMedida ?? ''}`.trim() : '—'}</Td>
              <Td muted>{item.limitePermitido ?? '—'}</Td>
              <Td>
                {item.conformidade === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  : <Pill color={item.conformidade ? '#16a34a' : '#dc2626'} bg={item.conformidade ? '#f0fdf4' : '#fef2f2'}>
                      {item.conformidade ? 'Conforme' : 'Não conf.'}
                    </Pill>
                }
              </Td>
              <Td muted>{fmt(item.dataColeta)}</Td>
              <Td>
                <span style={{ fontSize: 12, fontWeight: vencendo ? 700 : 400, color: vencendo ? '#dc2626' : 'var(--text-primary)' }}>
                  {fmt(item.dataProxima)}
                  {vencendo && dias !== null && <span style={{ fontSize: 10, marginLeft: 4 }}>({dias}d)</span>}
                </span>
              </Td>
              <Td>
                <Link href={`/meio-ambiente/monitoramentos/${item.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
