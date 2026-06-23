'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Coletora = { id: string; razaoSocial: string; tiposResiduos: string[] }

const FORMAS_DESTINACAO = [
  'Aterro Classe I', 'Aterro Classe II', 'Incineração', 'Co-processamento',
  'Reciclagem', 'Compostagem', 'Tratamento Biológico', 'Reutilização',
  'Logística Reversa', 'Rerrefino (óleos)',
]

export default function NovoCertificadoDestinacaoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [coletoras, setColetoras] = useState<Coletora[]>([])
  const [tiposResiduos, setTiposResiduos] = useState<string[]>([])
  const [customTipo, setCustomTipo] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', coletorId: '', numero: '', dataEmissao: '', dataVencimento: '',
    quantidadeTotal: '', unidadeMedida: 'kg', formaDestinacao: '', observacao: '',
  })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
    fetch('/api/meio-ambiente/coletoras').then(r => r.json()).then(setColetoras)
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const coletoraSel = coletoras.find(c => c.id === form.coletorId)
  const sugestoesTipo = coletoraSel?.tiposResiduos ?? []

  const toggleTipo = (t: string) => setTiposResiduos(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  const addCustom = () => {
    if (customTipo.trim() && !tiposResiduos.includes(customTipo.trim())) {
      setTiposResiduos(p => [...p, customTipo.trim()])
      setCustomTipo('')
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/meio-ambiente/certificados-destinacao', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tiposResiduos }),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/certificados-destinacao')
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
    <div style={{ maxWidth: 720 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Certificado de Destinação</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Comprovante de destinação ambientalmente adequada de resíduos</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa Geradora', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Empresa Coletora / Destinadora', true)}<select className="form-select" value={form.coletorId} onChange={e => set('coletorId', e.target.value)} required><option value="">Selecione...</option>{coletoras.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Nº do Certificado')}<input className="form-input" placeholder="Ex: CD-2024-001" value={form.numero} onChange={e => set('numero', e.target.value)} /></>)}
            {field(<>{label('Data de Emissão', true)}<input className="form-input" type="date" value={form.dataEmissao} onChange={e => set('dataEmissao', e.target.value)} required /></>)}
            {field(<>{label('Validade')}<input className="form-input" type="date" value={form.dataVencimento} onChange={e => set('dataVencimento', e.target.value)} /></>)}
            {field(<>{label('Forma de Destinação')}<select className="form-select" value={form.formaDestinacao} onChange={e => set('formaDestinacao', e.target.value)}>
              <option value="">Selecione...</option>
              {FORMAS_DESTINACAO.map(f => <option key={f} value={f}>{f}</option>)}
            </select></>)}
            {field(<>{label('Quantidade Total')}<input className="form-input" type="number" step="0.01" min="0" value={form.quantidadeTotal} onChange={e => set('quantidadeTotal', e.target.value)} /></>)}
            {field(<>{label('Unidade de Medida')}<select className="form-select" value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)}>
              <option value="kg">kg</option><option value="ton">ton</option>
              <option value="L">Litros</option><option value="m³">m³</option>
              <option value="un">Unidades</option>
            </select></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 14 }}>
            Tipos de Resíduos ({tiposResiduos.length})
          </p>
          {sugestoesTipo.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {sugestoesTipo.map(t => (
                <button key={t} type="button" onClick={() => toggleTipo(t)} style={{
                  padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: tiposResiduos.includes(t) ? '#16a34a' : 'var(--border)',
                  background: tiposResiduos.includes(t) ? '#f0fdf4' : 'var(--bg-card)',
                  color: tiposResiduos.includes(t) ? '#16a34a' : 'var(--text-secondary)',
                }}>
                  {tiposResiduos.includes(t) ? '✓ ' : ''}{t}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Descreva o tipo de resíduo..." value={customTipo}
              onChange={e => setCustomTipo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              style={{ flex: 1 }} />
            <button type="button" onClick={addCustom} style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Adicionar
            </button>
          </div>
          {tiposResiduos.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tiposResiduos.map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 600 }}>
                  {t}<button type="button" onClick={() => toggleTipo(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', display: 'flex', padding: 0 }}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {label('Observações')}
          <textarea className="form-input" rows={2} style={{ marginTop: 6 }} value={form.observacao} onChange={e => set('observacao', e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Certificado'}
          </button>
        </div>
      </form>
    </div>
  )
}
