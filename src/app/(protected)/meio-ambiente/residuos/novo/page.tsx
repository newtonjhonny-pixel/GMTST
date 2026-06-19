'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoResiduoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', descricao: '', codigoIBAMA: '', classeRisco: '',
    quantidade: '', unidadeMedida: 'kg', dataGeracao: '', destinacao: '',
    empresaColetora: '', mtr: '', certificadoDest: '', observacao: '',
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
    const res = await fetch('/api/meio-ambiente/residuos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/residuos')
    else alert('Erro ao salvar registro de resíduo')
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Registro de Resíduo</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Controle de geração, destinação e MTR</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Localização</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Empresa')}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)}><option value="">Selecione (opcional)...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade')}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} disabled={!form.empresaId}><option value="">Selecione (opcional)...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Identificação do Resíduo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Descrição', true)}<input className="form-input" placeholder="Ex: Óleo lubrificante usado..." value={form.descricao} onChange={e => set('descricao', e.target.value)} required /></>, 2)}
            {field(<>{label('Código IBAMA')} <input className="form-input" placeholder="Ex: 13 02 06" value={form.codigoIBAMA} onChange={e => set('codigoIBAMA', e.target.value)} /></>)}
            {field(<>{label('Classe de Risco')} <select className="form-select" value={form.classeRisco} onChange={e => set('classeRisco', e.target.value)}>
              <option value="">Selecione...</option>
              <option value="Classe I — Perigoso">Classe I — Perigoso</option>
              <option value="Classe II A — Não inerte">Classe II A — Não inerte</option>
              <option value="Classe II B — Inerte">Classe II B — Inerte</option>
            </select></>)}
            {field(<>{label('Quantidade', true)}<input className="form-input" type="number" step="0.01" placeholder="0,00" value={form.quantidade} onChange={e => set('quantidade', e.target.value)} required /></>)}
            {field(<>{label('Unidade de Medida', true)}<select className="form-select" value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)}>
              <option value="kg">kg</option>
              <option value="t">t (toneladas)</option>
              <option value="L">L (litros)</option>
              <option value="m³">m³</option>
              <option value="unidade">unidade</option>
            </select></>)}
            {field(<>{label('Data de Geração', true)}<input className="form-input" type="date" value={form.dataGeracao} onChange={e => set('dataGeracao', e.target.value)} required /></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Destinação e Documentação</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Destinação', true)}<input className="form-input" placeholder="Ex: Coprocessamento, Aterro industrial..." value={form.destinacao} onChange={e => set('destinacao', e.target.value)} required /></>, 2)}
            {field(<>{label('Empresa Coletora')} <input className="form-input" placeholder="Razão social da transportadora/coletora" value={form.empresaColetora} onChange={e => set('empresaColetora', e.target.value)} /></>)}
            {field(<>{label('Nº MTR')} <input className="form-input" placeholder="Manifesto de Transporte de Resíduos" value={form.mtr} onChange={e => set('mtr', e.target.value)} /></>)}
            {field(<>{label('Certificado de Destinação')} <input className="form-input" placeholder="Nº do certificado" value={form.certificadoDest} onChange={e => set('certificadoDest', e.target.value)} /></>, 2)}
            {field(<>{label('Observações')} <textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </form>
    </div>
  )
}
