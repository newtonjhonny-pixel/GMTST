import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const MAT_INFO: Record<string, { label: string; color: string; bg: string }> = {
  PAPEL:      { label: 'Papel',      color: '#185FA5', bg: '#E6F1FB' },
  PLASTICO:   { label: 'Plástico',   color: '#d97706', bg: '#fffbeb' },
  VIDRO:      { label: 'Vidro',      color: '#0891b2', bg: '#ecfeff' },
  METAL:      { label: 'Metal',      color: '#64748b', bg: '#f1f5f9' },
  ORGANICO:   { label: 'Orgânico',   color: '#16a34a', bg: '#f0fdf4' },
  REJEITO:    { label: 'Rejeito',    color: '#dc2626', bg: '#fef2f2' },
  ELETRONICO: { label: 'Eletrônico', color: '#7c3aed', bg: '#f5f3ff' },
  OUTRO:      { label: 'Outro',      color: '#64748b', bg: '#f8fafc' },
}

function fmt(d: Date | null) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}

const COLS = [
  { key: 'data',      label: 'Data',      width: '110px' },
  { key: 'empresa',   label: 'Empresa' },
  { key: 'unidade',   label: 'Unidade' },
  { key: 'material',  label: 'Material',  width: '110px' },
  { key: 'qtd',       label: 'Quantidade', width: '120px', align: 'center' as const },
  { key: 'dest',      label: 'Destinação' },
  { key: 'coletor',   label: 'Coletora',  width: '160px' },
]

export default async function ColetaSeletivaPage() {
  const registros = await prisma.coletaSeletiva.findMany({
    include: { empresa: true, unidade: true, coletor: true },
    orderBy: { data: 'desc' },
  })

  // Totais por material
  const totais: Record<string, number> = {}
  for (const r of registros) {
    totais[r.material] = (totais[r.material] ?? 0) + r.quantidade
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            Coleta Seletiva
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {registros.length} registro{registros.length !== 1 ? 's' : ''}
            {Object.entries(totais).map(([mat, qtd]) => (
              <span key={mat} style={{ marginLeft: 8, color: MAT_INFO[mat]?.color ?? 'var(--text-muted)', fontWeight: 600 }}>
                · {MAT_INFO[mat]?.label ?? mat}: {qtd.toFixed(1)} kg
              </span>
            ))}
          </p>
        </div>
        <Link href="/meio-ambiente/coleta-seletiva/novo" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
          <Plus size={14} />Novo Registro
        </Link>
      </div>
      <DataTable columns={COLS} rowCount={registros.length} empty={{ icon: '♻️', message: 'Nenhum registro de coleta seletiva' }}>
        {registros.map(r => (
          <Tr key={r.id}>
            <Td muted>{fmt(r.data)}</Td>
            <Td bold>{r.empresa.razaoSocial}</Td>
            <Td muted>{r.unidade.nome}</Td>
            <Td>
              <Pill color={MAT_INFO[r.material]?.color ?? '#64748b'} bg={MAT_INFO[r.material]?.bg ?? '#f8fafc'}>
                {MAT_INFO[r.material]?.label ?? r.material}
              </Pill>
            </Td>
            <Td align="center">
              <span style={{ fontWeight: 700 }}>{r.quantidade} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{r.unidadeMedida}</span></span>
            </Td>
            <Td muted>{r.destinacao ?? '—'}</Td>
            <Td muted>{r.coletor?.razaoSocial ?? '—'}</Td>
          </Tr>
        ))}
      </DataTable>
    </div>
  )
}
