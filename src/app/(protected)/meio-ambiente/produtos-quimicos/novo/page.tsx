'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }

export default function NovoProdutoQuimicoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [riscos, setRiscos] = useState<string[]>([])
  const [epis, setEpis] = useState<string[]>([])
  const [riscoInput, setRiscoInput] = useState('')
  const [epiInput, setEpiInput] = useState('')
  const [form, setForm] = useState({
    empresaId: '', nome: '', cas: '', fornecedor: '',
    fispq: '', armazenagem: '', observacao: '',
  })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function addTag(list: string[], setList: (v: string[]) => void, val: string, setVal: (v: string) => void) {
    const v = val.trim()
    if (v && !list.includes(v)) setList([...list, v])
    setVal('')
  }
  function removeTag(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.filter(i => i !== item))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/meio-ambiente/produtos-quimicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, riscos, epi: epis }),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/produtos-quimicos')
    else alert('Erro ao salvar produto químico')
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

  const TagInput = ({ tags, onAdd, onRemove, input, setInput, placeholder, tagColor }: {
    tags: string[]; onAdd: () => void; onRemove: (t: string) => void;
    input: string; setInput: (v: string) => void; placeholder: string;
    tagColor: { bg: string; text: string }
  }) => (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', background: 'var(--bg-app)', minHeight: 36, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: tagColor.bg, color: tagColor.text }}>
          {t}
          <button type="button" onClick={() => onRemove(t)} style={{ lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: tagColor.text, opacity: .7 }}><X size={10} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); onAdd() } }}
        placeholder={tags.length === 0 ? placeholder : '+'}
        style={{ flex: 1, minWidth: 80, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Produto Químico</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Cadastro de produto com FISPQ e controle de riscos</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Empresa')}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)}><option value="">Selecione (opcional)...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>, 2)}

            {field(<>{label('Nome do Produto', true)}<input className="form-input" placeholder="Nome comercial ou técnico" value={form.nome} onChange={e => set('nome', e.target.value)} required /></>, 2)}

            {field(<>{label('Número CAS')} <input className="form-input" placeholder="Ex: 64-17-5" value={form.cas} onChange={e => set('cas', e.target.value)} /></>)}
            {field(<>{label('Fornecedor')} <input className="form-input" placeholder="Nome do fornecedor" value={form.fornecedor} onChange={e => set('fornecedor', e.target.value)} /></>)}

            {field(<>{label('Link da FISPQ')} <input className="form-input" placeholder="URL da Ficha de Segurança" value={form.fispq} onChange={e => set('fispq', e.target.value)} /></>, 2)}

            {field(
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {label('Riscos / Classificação GHS')}
                <TagInput tags={riscos} onAdd={() => addTag(riscos, setRiscos, riscoInput, setRiscoInput)} onRemove={t => removeTag(riscos, setRiscos, t)} input={riscoInput} setInput={setRiscoInput} placeholder="Digite um risco e pressione Enter..." tagColor={{ bg: '#fef2f2', text: '#dc2626' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Ex: Inflamável, Tóxico, Corrosivo — Enter ou vírgula para adicionar</span>
              </div>, 2
            )}

            {field(
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {label('EPIs Necessários')}
                <TagInput tags={epis} onAdd={() => addTag(epis, setEpis, epiInput, setEpiInput)} onRemove={t => removeTag(epis, setEpis, t)} input={epiInput} setInput={setEpiInput} placeholder="Digite um EPI e pressione Enter..." tagColor={{ bg: '#eff6ff', text: '#2563eb' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Ex: Luvas nitrílicas, Óculos, Respirador PFF2 — Enter ou vírgula para adicionar</span>
              </div>, 2
            )}

            {field(<>{label('Condições de Armazenagem')} <textarea className="form-input" rows={2} placeholder="Temperatura, incompatibilidades, ventilação..." value={form.armazenagem} onChange={e => set('armazenagem', e.target.value)} /></>, 2)}
            {field(<>{label('Observações')} <textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
