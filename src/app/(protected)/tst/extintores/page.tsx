import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

function diasPara(d: Date | null) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}
function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
function VencBadge({ d, label }: { d: Date | null; label?: string }) {
  const dias = diasPara(d)
  if (dias === null) return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
  if (dias < 0)   return <Pill color="#dc2626" bg="#fef2f2">{label ? `${label} vencida` : 'Vencida'}</Pill>
  if (dias <= 30) return <Pill color="#d97706" bg="#fffbeb">{fmt(d)} ({dias}d)</Pill>
  return <Pill color="#16a34a" bg="#f0fdf4">{fmt(d)}</Pill>
}

const TIPO_LABEL: Record<string, string> = {
  AGUA:'Água', PO_ABC:'Pó ABC', PO_BC:'Pó BC', CO2:'CO₂', ESPUMA:'Espuma', HALONADO:'Halonado',
}

const COLS = [
  { key: 'codigo',     label: 'Código',     width: '90px' },
  { key: 'tipo',       label: 'Tipo',       width: '90px' },
  { key: 'cap',        label: 'Capacidade', width: '90px' },
  { key: 'local',      label: 'Localização' },
  { key: 'empresa',    label: 'Empresa' },
  { key: 'recarga',    label: 'Próx. Recarga' },
  { key: 'inspecao',   label: 'Próx. Inspeção' },
  { key: 'status',     label: 'Status',     width: '90px' },
]

export default async function ExtintoresPage() {
  const extintores = await prisma.extintor.findMany({
    include: { empresa: true, unidade: true },
    orderBy: { proximaInspecao: 'asc' },
  })
  const vencidos = extintores.filter(e => (diasPara(e.proximaInspecao) ?? 1) < 0).length
  const aVencer  = extintores.filter(e => { const d = diasPara(e.proximaInspecao); return d !== null && d >= 0 && d <= 30 }).length

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Controle de Extintores
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {extintores.length} extintor{extintores.length !== 1 ? 'es' : ''}
            {vencidos > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}> · {vencidos} com inspeção vencida</span>}
            {aVencer  > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}> · {aVencer} a vencer em 30d</span>}
          </p>
        </div>
        <Link href="/tst/extintores/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Extintor
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={extintores.length} empty={{ icon: '🧯', message: 'Nenhum extintor cadastrado' }}>
        {extintores.map(e => (
          <Tr key={e.id}>
            <Td mono bold>{e.codigo}</Td>
            <Td><Pill color="#185FA5" bg="#E6F1FB">{TIPO_LABEL[e.tipo] ?? e.tipo}</Pill></Td>
            <Td muted>{e.capacidade}</Td>
            <Td>{e.localizacao}{e.setor ? ` — ${e.setor}` : ''}</Td>
            <Td muted>{e.empresa.razaoSocial}</Td>
            <Td><VencBadge d={e.proximaRecarga} /></Td>
            <Td><VencBadge d={e.proximaInspecao} /></Td>
            <Td>
              <Pill color={e.status === 'ATIVO' ? '#16a34a' : '#64748b'} bg={e.status === 'ATIVO' ? '#f0fdf4' : '#f8fafc'}>
                {e.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
              </Pill>
            </Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
