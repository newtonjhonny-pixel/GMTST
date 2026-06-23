'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type EPI = { id: string; nome: string; ca: string | null }

export default function NovaSolicitacaoCompraPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [epis, setEpis] = useState<EPI[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId:'', epiId:'', descricaoEPI:'', quantidade:'1', dataSolicitacao:'',
    solicitante:'', justificativa:'', status:'ABERTA',
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
    const res = await fetch('/api/tst/solicitacoes-compra', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, quantidade: Number(form.quantidade) }),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/solicitacoes-compra')
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

  return (
    <div style={{maxWidth:640}}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>router.back()} style={{color:'var(--text-muted)',display:'flex',alignItems:'center'}}><ArrowLeft size={16}/></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Nova Solicitação de Compra</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Solicitação de aquisição de EPI</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={form.empresaId} onChange={e=>set('empresaId',e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Data da Solicitação',true)}<input className="form-input" type="date" value={form.dataSolicitacao} onChange={e=>set('dataSolicitacao',e.target.value)} required/></>)}
            {field(<>{label('EPI (opcional)')}<select className="form-select" value={form.epiId} onChange={e=>{
              const epi = epis.find(ep=>ep.id===e.target.value)
              setForm(f=>({...f, epiId:e.target.value, descricaoEPI: epi?.nome ?? f.descricaoEPI}))
            }} disabled={!form.empresaId}>
              <option value="">Selecione ou descreva abaixo...</option>
              {epis.map(e=><option key={e.id} value={e.id}>{e.nome}{e.ca ? ` (CA ${e.ca})` : ''}</option>)}
            </select></>, 2)}
            {field(<>{label('Descrição do EPI',true)}<input className="form-input" placeholder="Nome do EPI solicitado" value={form.descricaoEPI} onChange={e=>set('descricaoEPI',e.target.value)} required/></>, 2)}
            {field(<>{label('Quantidade',true)}<input className="form-input" type="number" min="1" value={form.quantidade} onChange={e=>set('quantidade',e.target.value)} required/></>)}
            {field(<>{label('Solicitante')}<input className="form-input" placeholder="Nome do responsável pela solicitação" value={form.solicitante} onChange={e=>set('solicitante',e.target.value)}/></>)}
            {field(<>{label('Justificativa')}<textarea className="form-input" rows={3} placeholder="Motivo da compra, urgência, estoque zerado..." value={form.justificativa} onChange={e=>set('justificativa',e.target.value)}/></>, 2)}
            {field(<>{label('Status Inicial')}<select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
              <option value="ABERTA">Aberta</option>
              <option value="APROVADA">Aprovada</option>
            </select></>)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar Solicitação'}
          </button>
        </div>
      </form>
    </div>
  )
}
