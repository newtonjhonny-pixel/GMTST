'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoPGRSPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId:'', unidadeId:'', versao:'1.0', dataElaboracao:'', dataVigencia:'',
    dataRevisao:'', responsavel:'', consultor:'', observacao:'',
  })

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r => r.json()).then(setUnidades)
    setForm(f => ({ ...f, unidadeId: '' }))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/meio-ambiente/pgrs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/pgrs')
    else alert('Erro ao salvar')
  }

  const label = (txt: string, req?: boolean) => (
    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
      {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
  )
  const field = (children: React.ReactNode, span?: number) => (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  )

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo PGRS</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Plano de Gerenciamento de Resíduos Sólidos — Lei 12.305/2010</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Versão', true)}<input className="form-input" placeholder="Ex: 1.0, 2.1" value={form.versao} onChange={e => set('versao', e.target.value)} required /></>)}
            {field(<>{label('Data de Elaboração', true)}<input className="form-input" type="date" value={form.dataElaboracao} onChange={e => set('dataElaboracao', e.target.value)} required /></>)}
            {field(<>{label('Vigência até', true)}<input className="form-input" type="date" value={form.dataVigencia} onChange={e => set('dataVigencia', e.target.value)} required /></>)}
            {field(<>{label('Próxima Revisão')}<input className="form-input" type="date" value={form.dataRevisao} onChange={e => set('dataRevisao', e.target.value)} /></>)}
            {field(<>{label('Responsável Técnico')}<input className="form-input" placeholder="Nome e registro profissional" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Consultoria / Empresa')}<input className="form-input" placeholder="Empresa que elaborou o plano" value={form.consultor} onChange={e => set('consultor', e.target.value)} /></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={3} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar PGRS'}
          </button>
        </div>
      </form>
    </div>
  )
}
