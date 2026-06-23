'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type EPI = { id: string; nome: string; ca: string | null; descricao?: string }

export default function MovimentoEstoqueEpiPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [epis, setEpis] = useState<EPI[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId:'', epiId:'', tipo:'ENTRADA', quantidade:'1', dataMovimento:'', responsavel:'', observacao:'',
  })

  useEffect(() => { fetch('/api/empresas').then(r=>r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setEpis([]); return }
    fetch(`/api/epis?empresaId=${form.empresaId}`).then(r=>r.json()).then(setEpis).catch(()=>setEpis([]))
    setForm(f=>({...f, epiId:''}))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/estoque-epi', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, quantidade: Number(form.quantidade), dataMovimento: form.dataMovimento }),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/estoque-epi')
    else alert('Erro ao salvar')
  }

  const label = (txt: string, req?: boolean) => (
    <label style={{fontSize:11,fontWeight:600,color:'var(--text-secondary)',letterSpacing:'.4px',textTransform:'uppercase'}}>
      {txt}{req && <span style={{color:'#ef4444'}}> *</span>}
    </label>
  )
  const field = (children: React.ReactNode, span?: number) => (
    <div style={{gridColumn:span?`span ${span}`:undefined,display:'flex',flexDirection:'column',gap:6}}>{children}</div>
  )

  const TIPO_INFO: Record<string, {color: string; bg: string; desc: string}> = {
    ENTRADA:{ color:'#16a34a', bg:'#f0fdf4', desc:'Adiciona ao estoque (compras, devoluções)' },
    SAIDA:  { color:'#dc2626', bg:'#fef2f2', desc:'Remove do estoque (entregas, consumo)' },
    AJUSTE: { color:'#d97706', bg:'#fffbeb', desc:'Acerto de inventário — substitui saldo atual' },
  }

  return (
    <div style={{maxWidth:640}}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>router.back()} style={{color:'var(--text-muted)',display:'flex',alignItems:'center'}}><ArrowLeft size={16}/></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Registrar Movimento de Estoque</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Entrada, saída ou ajuste de EPI</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={form.empresaId} onChange={e=>set('empresaId',e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Tipo de Movimento',true)}<select className="form-select" value={form.tipo} onChange={e=>set('tipo',e.target.value)} required>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
              <option value="AJUSTE">Ajuste de Inventário</option>
            </select></>)}
            {form.tipo && <div style={{gridColumn:'span 2',padding:'10px 14px',borderRadius:8,background:TIPO_INFO[form.tipo].bg,border:`1px solid ${TIPO_INFO[form.tipo].color}33`,fontSize:12,color:TIPO_INFO[form.tipo].color,fontWeight:600}}>
              {TIPO_INFO[form.tipo].desc}
            </div>}
            {field(<>{label('EPI',true)}<select className="form-select" value={form.epiId} onChange={e=>set('epiId',e.target.value)} required disabled={!form.empresaId}>
              <option value="">Selecione...</option>
              {epis.map(e=><option key={e.id} value={e.id}>{e.nome}{e.ca ? ` (CA ${e.ca})` : ''}</option>)}
            </select></>, 2)}
            {field(<>{label('Quantidade',true)}<input className="form-input" type="number" min="1" value={form.quantidade} onChange={e=>set('quantidade',e.target.value)} required/></>)}
            {field(<>{label('Data do Movimento',true)}<input className="form-input" type="date" value={form.dataMovimento} onChange={e=>set('dataMovimento',e.target.value)} required/></>)}
            {field(<>{label('Responsável')}<input className="form-input" placeholder="Quem realizou o movimento" value={form.responsavel} onChange={e=>set('responsavel',e.target.value)}/></>, 2)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e=>set('observacao',e.target.value)}/></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Registrar Movimento'}
          </button>
        </div>
      </form>
    </div>
  )
}
