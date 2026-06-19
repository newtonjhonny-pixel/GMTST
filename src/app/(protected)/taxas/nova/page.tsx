'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovaTaxaPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', tipo: '', orgao: '',
    competencia: '', vencimento: '', valor: '',
    status: 'PENDENTE', responsavel: '', observacao: '',
  })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
  }, [])

  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r => r.json()).then(setUnidades)
    setForm(f => ({ ...f, unidadeId: '' }))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/taxas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/taxas')
    else alert('Erro ao salvar taxa')
  }

  const label = (txt: string, req?: boolean) => (
    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
      {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
  )

  const field = (children: React.ReactNode, span?: number) => (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Taxa</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>IBAMA, CETESB, municipal e outras taxas ambientais e de TST</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}

            {field(<>{label('Tipo de Taxa', true)}<input className="form-input" placeholder="Ex: TFA, TCFA, ISS, Taxa de Vistoria..." value={form.tipo} onChange={e => set('tipo', e.target.value)} required /></>)}
            {field(<>{label('Órgão', true)}<input className="form-input" placeholder="Ex: IBAMA, CETESB, Prefeitura..." value={form.orgao} onChange={e => set('orgao', e.target.value)} required /></>)}

            {field(<>{label('Competência')}<input className="form-input" placeholder="Ex: 2025, Jan/2025, 1º Tri 2025..." value={form.competencia} onChange={e => set('competencia', e.target.value)} /></>)}
            {field(<>{label('Vencimento', true)}<input className="form-input" type="date" value={form.vencimento} onChange={e => set('vencimento', e.target.value)} required /></>)}

            {field(<>{label('Valor (R$)')}<input className="form-input" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={e => set('valor', e.target.value)} /></>)}
            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="VENCIDO">Vencido</option>
              <option value="CANCELADO">Cancelado</option>
            </select></>)}

            {field(<>{label('Responsável')}<input className="form-input" placeholder="Nome do responsável pelo pagamento" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>, 2)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Taxa'}
          </button>
        </div>
      </form>
    </div>
  )
}
