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

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  VIGENTE:   { bg: '#f0fdf4', text: '#16a34a', label: 'Vigente' },
  VENCIDO:   { bg: '#fef2f2', text: '#dc2626', label: 'Vencido' },
  A_VENCER:  { bg: '#fffbeb', text: '#d97706', label: 'A Vencer' },
  CANCELADO: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' },
  ARQUIVADO: { bg: '#f1f5f9', text: '#475569', label: 'Arquivado' },
}

const COLS = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'ctf', label: 'Nº CTF', width: '110px' },
  { key: 'cr', label: 'Cert. Regularidade', width: '130px' },
  { key: 'valCR', label: 'Validade CR', width: '110px' },
  { key: 'rapp', label: 'RAPP Período', width: '110px' },
  { key: 'envioRAPP', label: 'Envio RAPP', width: '100px' },
  { key: 'responsavel', label: 'Responsável' },
  { key: 'status', label: 'Status', width: '110px' },
  { key: 'acoes', label: '', width: '50px' },
]

export default async function IbamaPage() {
  const registros = await prisma.registroIBAMA.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { createdAt: 'desc' },
  })

  const vencidos = registros.filter(r => r.status === 'VENCIDO').length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            IBAMA / CTF / RAPP
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {registros.length} registro{registros.length !== 1 ? 's' : ''} · Cadastro Técnico Federal e Relatório Anual de Atividades Potencialmente Poluidoras
            {vencidos > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {vencidos} vencido{vencidos !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link
          href="/meio-ambiente/ibama/novo"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <Plus size={14} />
          Novo Registro
        </Link>
      </div>

      <DataTable columns={COLS} rowCount={registros.length} empty={{ icon: '🌿', message: 'Nenhum registro IBAMA cadastrado' }}>
        {registros.map(r => {
          const ss = STATUS_STYLE[r.status] ?? STATUS_STYLE.VIGENTE
          const dias = diasPara(r.validadeCR)
          const vencendo = dias !== null && dias >= 0 && dias <= 30
          return (
            <Tr key={r.id}>
              <Td bold>{r.empresa.razaoSocial}</Td>
              <Td muted>{r.unidade?.nome ?? '—'}</Td>
              <Td mono>{r.numeroCTF ?? '—'}</Td>
              <Td mono>{r.certificadoReg ?? '—'}</Td>
              <Td>
                <span style={{ fontSize: 12, fontWeight: vencendo ? 700 : 400, color: vencendo ? '#dc2626' : 'var(--text-primary)' }}>
                  {fmt(r.validadeCR)}
                  {vencendo && dias !== null && <span style={{ fontSize: 10, marginLeft: 4 }}>({dias}d)</span>}
                </span>
              </Td>
              <Td muted>{r.periodoRAPP ?? '—'}</Td>
              <Td muted>{fmt(r.dataEnvioRAPP)}</Td>
              <Td muted>{r.responsavel ?? '—'}</Td>
              <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
              <Td>
                <Link href={`/meio-ambiente/ibama/${r.id}`} className="text-[11px] font-semibold" style={{ color: 'var(--brand-from)' }}>Ver</Link>
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
