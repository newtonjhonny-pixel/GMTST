'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoRecursoHidricoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', tipo: 'OUTORGA_CAPTACAO',
    numeroOutorga: '', orgaoOtorgante: '', emissao: '', vencimento: '',
    vazaoAutorizada: '', unidadeMedida: 'm³/h', finalidade: '',
    responsavel: '', observacao: '',
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
    const res = await fetch('/api/meio-ambiente/recursos-hidricos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/recursos-hidricos')
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

  const needsOutorga = ['OUTORGA_CAPTACAO', 'OUTORGA_LANCAMENTO'].includes(form.tipo)

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Recurso Hídrico</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Outorga de captação, lançamento, poço artesiano ou efluente</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Tipo', true)}<select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
              <option value="OUTORGA_CAPTACAO">Outorga de Captação</option>
              <option value="OUTORGA_LANCAMENTO">Outorga de Lançamento</option>
              <option value="POCO_ARTESIANO">Poço Artesiano</option>
              <option value="EFLUENTE_TRATADO">Efluente Tratado</option>
              <option value="AGUA_REUSO">Água de Reúso</option>
            </select></>, 2)}
            {needsOutorga && <>
              {field(<>{label('Nº da Outorga')}<input className="form-input" placeholder="Ex: 001/2024-DAEE" value={form.numeroOutorga} onChange={e => set('numeroOutorga', e.target.value)} /></>)}
              {field(<>{label('Órgão Outorgante')}<input className="form-input" placeholder="DAEE, ANA, IGAM, INEA..." value={form.orgaoOtorgante} onChange={e => set('orgaoOtorgante', e.target.value)} /></>)}
            </>}
            {field(<>{label('Data de Emissão')}<input className="form-input" type="date" value={form.emissao} onChange={e => set('emissao', e.target.value)} /></>)}
            {field(<>{label('Validade')}<input className="form-input" type="date" value={form.vencimento} onChange={e => set('vencimento', e.target.value)} /></>)}
            {field(<>{label('Vazão Autorizada')}<input className="form-input" type="number" step="0.001" min="0" value={form.vazaoAutorizada} onChange={e => set('vazaoAutorizada', e.target.value)} /></>)}
            {field(<>{label('Unidade da Vazão')}<select className="form-select" value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)}>
              <option value="m³/h">m³/h</option>
              <option value="m³/dia">m³/dia</option>
              <option value="m³/mês">m³/mês</option>
              <option value="L/s">L/s</option>
              <option value="L/min">L/min</option>
            </select></>)}
            {field(<>{label('Finalidade / Uso')}<input className="form-input" placeholder="Abastecimento, irrigação, industrial..." value={form.finalidade} onChange={e => set('finalidade', e.target.value)} /></>)}
            {field(<>{label('Responsável Técnico')}<input className="form-input" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Recurso Hídrico'}
          </button>
        </div>
      </form>
    </div>
  )
}
