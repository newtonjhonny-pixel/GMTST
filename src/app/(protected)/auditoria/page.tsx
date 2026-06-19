import { prisma } from '@/lib/prisma'
import { DataTable, Td, Tr } from '@/components/ui/data-table'

function fmt(d: Date) {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ENTIDADE_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  PGR:                  { label: 'PGR',            bg: '#eff6ff', text: '#2563eb' },
  PCMSO:                { label: 'PCMSO',          bg: '#fdf4ff', text: '#7c3aed' },
  LTCAT:                { label: 'LTCAT',          bg: '#f0fdf4', text: '#16a34a' },
  PPP:                  { label: 'PPP',            bg: '#fff7ed', text: '#c2410c' },
  InventarioRisco:      { label: 'Inv. Riscos',    bg: '#fef2f2', text: '#dc2626' },
  LicencaAmbiental:     { label: 'Licença',        bg: '#ecfdf5', text: '#059669' },
  Condicionante:        { label: 'Condicionante',  bg: '#f0fdf4', text: '#16a34a' },
  RegistroIBAMA:        { label: 'IBAMA',          bg: '#ecfeff', text: '#0e7490' },
  MonitoramentoAmb:     { label: 'Monitoramento',  bg: '#f0f9ff', text: '#0284c7' },
  ControleResiduo:      { label: 'Resíduo',        bg: '#fafaf9', text: '#57534e' },
  ProdutoQuimico:       { label: 'Prod. Químico',  bg: '#fff1f2', text: '#be123c' },
  Pendencia:            { label: 'Pendência',      bg: '#fffbeb', text: '#d97706' },
  Taxa:                 { label: 'Taxa',           bg: '#fef9c3', text: '#a16207' },
  Certificacao:         { label: 'Certificação',   bg: '#f5f3ff', text: '#7c3aed' },
  DocumentoLegal:       { label: 'Documento',      bg: '#f1f5f9', text: '#475569' },
  Colaborador:          { label: 'Colaborador',    bg: '#f0f9ff', text: '#0369a1' },
  Empresa:              { label: 'Empresa',        bg: '#fafaf9', text: '#44403c' },
  Unidade:              { label: 'Unidade',        bg: '#fafaf9', text: '#44403c' },
  ASO:                  { label: 'ASO',            bg: '#fdf4ff', text: '#9333ea' },
  EPI:                  { label: 'EPI',            bg: '#fff7ed', text: '#ea580c' },
  Treinamento:          { label: 'Treinamento',    bg: '#f0fdf4', text: '#15803d' },
  Acidente:             { label: 'Acidente',       bg: '#fef2f2', text: '#dc2626' },
  InspecaoSeguranca:    { label: 'Inspeção',       bg: '#eff6ff', text: '#1d4ed8' },
}

const ACAO_STYLE: Record<string, { bg: string; text: string }> = {
  CRIAR:    { bg: '#f0fdf4', text: '#16a34a' },
  ATUALIZAR:{ bg: '#eff6ff', text: '#2563eb' },
  EXCLUIR:  { bg: '#fef2f2', text: '#dc2626' },
  LOGIN:    { bg: '#f5f3ff', text: '#7c3aed' },
  EXPORTAR: { bg: '#f0f9ff', text: '#0284c7' },
}

const COLS = [
  { key: 'data',      label: 'Data / Hora',  width: '150px' },
  { key: 'entidade',  label: 'Módulo',        width: '120px' },
  { key: 'acao',      label: 'Ação',          width: '100px' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'usuario',   label: 'Usuário',       width: '160px' },
]

export default async function AuditoriaPage() {
  const historicos = await prisma.historico.findMany({
    include: { usuario: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
          Trilha de Auditoria
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {historicos.length} registro{historicos.length !== 1 ? 's' : ''} · Últimas 500 ações do sistema
        </p>
      </div>

      <DataTable columns={COLS} rowCount={historicos.length} empty={{ icon: '🔍', message: 'Nenhum registro de auditoria encontrado' }}>
        {historicos.map(h => {
          const ent = ENTIDADE_LABEL[h.entidade] ?? { label: h.entidade, bg: 'var(--bg-card-alt)', text: 'var(--text-secondary)' }
          const ac  = ACAO_STYLE[h.acao] ?? { bg: 'var(--bg-card-alt)', text: 'var(--text-secondary)' }
          return (
            <Tr key={h.id}>
              <Td mono>
                <span style={{ fontSize: 11 }}>{fmt(h.createdAt)}</span>
              </Td>
              <Td>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: ent.bg, color: ent.text }}>
                  {ent.label}
                </span>
              </Td>
              <Td>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: ac.bg, color: ac.text }}>
                  {h.acao}
                </span>
              </Td>
              <Td>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{h.descricao ?? '—'}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>ID: {h.entidadeId}</span>
              </Td>
              <Td>
                {h.usuario
                  ? <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{h.usuario.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{h.usuario.email}</span>
                    </div>
                  : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sistema</span>
                }
              </Td>
            </Tr>
          )
        })}
      </DataTable>
    </div>
  )
}
