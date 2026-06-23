'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Colaborador = { id: string; nome: string; cpf: string; funcao: string }

export default function NovoDireitoRecusaPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [unidadeId, setUnidadeId] = useState('')
  const [form, setForm] = useState({
    colaboradorId:'', data:'', descricaoRisco:'', motivoRecusa:'',
    providencias:'', responsavel:'', resolvido:'false',
  })

  useEffect(() => { fetch('/api/empresas').then(r=>r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${empresaId}`).then(r=>r.json()).then(setUnidades)
    setUnidadeId('')
  }, [empresaId])
  useEffect(() => {
    if (!unidadeId) { setColaboradores([]); return }
    fetch(`/api/colaboradores?unidadeId=${unidadeId}`).then(r=>r.json()).then(setColaboradores)
    setForm(f=>({...f, colaboradorId:''}))
  }, [unidadeId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/direito-recusa', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, empresaId, resolvido: form.resolvido === 'true' }),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/direito-recusa')
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
    <div style={{maxWidth:760}}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>router.back()} style={{color:'var(--text-muted)',display:'flex',alignItems:'center'}}><ArrowLeft size={16}/></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Registrar Direito de Recusa</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Recusa de trabalho em condição de risco grave e iminente — NR-1</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={empresaId} onChange={e=>setEmpresaId(e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade',true)}<select className="form-select" value={unidadeId} onChange={e=>setUnidadeId(e.target.value)} required disabled={!empresaId}><option value="">Selecione...</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Colaborador',true)}<select className="form-select" value={form.colaboradorId} onChange={e=>set('colaboradorId',e.target.value)} required disabled={!unidadeId}>
              <option value="">Selecione...</option>
              {colaboradores.map(c=><option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>)}
            </select></>, 2)}
            {field(<>{label('Data da Ocorrência',true)}<input className="form-input" type="date" value={form.data} onChange={e=>set('data',e.target.value)} required/></>)}
            {field(<>{label('Responsável pela apuração')}<input className="form-input" placeholder="Técnico ou gestor SST" value={form.responsavel} onChange={e=>set('responsavel',e.target.value)}/></>)}
            {field(<>{label('Descrição do Risco',true)}<textarea className="form-input" rows={3} placeholder="Descreva a condição de risco que motivou a recusa..." value={form.descricaoRisco} onChange={e=>set('descricaoRisco',e.target.value)} required/></>, 2)}
            {field(<>{label('Motivo da Recusa',true)}<textarea className="form-input" rows={3} placeholder="Justificativa apresentada pelo colaborador..." value={form.motivoRecusa} onChange={e=>set('motivoRecusa',e.target.value)} required/></>, 2)}
            {field(<>{label('Providências Tomadas')}<textarea className="form-input" rows={3} placeholder="Ações imediatas, correções, medidas adotadas..." value={form.providencias} onChange={e=>set('providencias',e.target.value)}/></>, 2)}
            {field(<>{label('Situação resolvida?')}<select className="form-select" value={form.resolvido} onChange={e=>set('resolvido',e.target.value)}>
              <option value="false">Pendente</option>
              <option value="true">Resolvido</option>
            </select></>)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar Registro'}
          </button>
        </div>
      </form>
    </div>
  )
}
