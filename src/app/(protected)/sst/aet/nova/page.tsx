'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

const FATORES = ['Postura inadequada','Esforço repetitivo','Levantamento de peso','Ritmo de trabalho excessivo','Monotonia','Trabalho em pé prolongado','Trabalho sentado prolongado','Iluminação inadequada','Vibração','Temperatura extrema','Ruído','Pressão por produção']
const ATIVIDADES_SUGESTOES = ['Digitação','Operação de máquinas','Carga e descarga manual','Trabalho em linha de produção','Atendimento ao público','Condução de veículos','Atividades administrativas','Limpeza e conservação']

export default function NovaAETPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [fatores, setFatores] = useState<string[]>([])
  const [atividades, setAtividades] = useState<string[]>([])
  const [fatorCustom, setFatorCustom] = useState('')
  const [atividadeCustom, setAtividadeCustom] = useState('')
  const [form, setForm] = useState({
    empresaId:'', unidadeId:'', responsavelTecnico:'', crea:'', art:'',
    dataEmissao:'', vigencia:'', setoresAvaliados:'', status:'VIGENTE', observacao:'',
  })

  useEffect(() => { fetch('/api/empresas').then(r=>r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r=>r.json()).then(setUnidades)
    setForm(f=>({...f, unidadeId:''}))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))
  const toggleFator = (f: string) => setFatores(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f])
  const toggleAtiv  = (a: string) => setAtividades(p=>p.includes(a)?p.filter(x=>x!==a):[...p,a])

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/aet', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({...form, fatoresErgonomicos: fatores, atividades}),
    })
    setLoading(false)
    if (res.ok) router.push('/sst/aet')
    else alert('Erro ao salvar AET')
  }

  const label = (txt: string, req?: boolean) => (
    <label style={{fontSize:11,fontWeight:600,color:'var(--text-secondary)',letterSpacing:'.4px',textTransform:'uppercase'}}>
      {txt}{req && <span style={{color:'#ef4444'}}> *</span>}
    </label>
  )
  const field = (children: React.ReactNode, span?: number) => (
    <div style={{gridColumn:span?`span ${span}`:undefined,display:'flex',flexDirection:'column',gap:6}}>
      {children}
    </div>
  )
  const chipStyle = (sel: boolean) => ({
    padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:500,cursor:'pointer',
    border:`1px solid ${sel?'var(--brand-primary,#0ea5e9)':'var(--border)'}`,
    background:sel?'var(--brand-primary,#0ea5e9)':'var(--bg-card)',
    color:sel?'#fff':'var(--text-secondary)',
  })

  return (
    <div style={{maxWidth:800}}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>router.back()} style={{color:'var(--text-muted)',display:'flex',alignItems:'center'}}><ArrowLeft size={16}/></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Nova AET</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Análise Ergonômica do Trabalho — NR-17</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={form.empresaId} onChange={e=>set('empresaId',e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade',true)}<select className="form-select" value={form.unidadeId} onChange={e=>set('unidadeId',e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Responsável Técnico',true)}<input className="form-input" value={form.responsavelTecnico} onChange={e=>set('responsavelTecnico',e.target.value)} required/></>)}
            {field(<>{label('CREA')}<input className="form-input" placeholder="Nº do CREA" value={form.crea} onChange={e=>set('crea',e.target.value)}/></>)}
            {field(<>{label('ART')}<input className="form-input" placeholder="Nº da ART" value={form.art} onChange={e=>set('art',e.target.value)}/></>)}
            {field(<>{label('Data de Emissão',true)}<input className="form-input" type="date" value={form.dataEmissao} onChange={e=>set('dataEmissao',e.target.value)} required/></>)}
            {field(<>{label('Vigência')}<input className="form-input" type="date" value={form.vigencia} onChange={e=>set('vigencia',e.target.value)}/></>)}
            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
              <option value="VIGENTE">Vigente</option><option value="A_VENCER">A Vencer</option>
              <option value="VENCIDO">Vencida</option><option value="ARQUIVADO">Arquivada</option>
            </select></>)}
            {field(<>{label('Setores Avaliados')}<input className="form-input" placeholder="Ex: Produção, Escritório, Almoxarifado" value={form.setoresAvaliados} onChange={e=>set('setoresAvaliados',e.target.value)}/></>, 2)}
          </div>
        </div>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>Fatores Ergonômicos Identificados</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
            {FATORES.map(f=><button key={f} type="button" style={chipStyle(fatores.includes(f))} onClick={()=>toggleFator(f)}>{f}</button>)}
          </div>
          {fatores.filter(f=>!FATORES.includes(f)).map(f=>(
            <span key={f} style={{...chipStyle(true),display:'inline-flex',alignItems:'center',gap:4,marginRight:8,marginBottom:8}}>
              {f}<X size={10} style={{cursor:'pointer'}} onClick={()=>toggleFator(f)}/>
            </span>
          ))}
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <input className="form-input" style={{flex:1}} placeholder="Adicionar fator específico..." value={fatorCustom} onChange={e=>setFatorCustom(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),fatorCustom.trim()&&(toggleFator(fatorCustom.trim()),setFatorCustom('')))}/>
            <button type="button" onClick={()=>{if(fatorCustom.trim()){toggleFator(fatorCustom.trim());setFatorCustom('')}}} style={{padding:'0 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center'}}><Plus size={14}/></button>
          </div>
        </div>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>Atividades Avaliadas</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
            {ATIVIDADES_SUGESTOES.map(a=><button key={a} type="button" style={chipStyle(atividades.includes(a))} onClick={()=>toggleAtiv(a)}>{a}</button>)}
          </div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <input className="form-input" style={{flex:1}} placeholder="Adicionar atividade..." value={atividadeCustom} onChange={e=>setAtividadeCustom(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),atividadeCustom.trim()&&(toggleAtiv(atividadeCustom.trim()),setAtividadeCustom('')))}/>
            <button type="button" onClick={()=>{if(atividadeCustom.trim()){toggleAtiv(atividadeCustom.trim());setAtividadeCustom('')}}} style={{padding:'0 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center'}}><Plus size={14}/></button>
          </div>
        </div>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          {field(<>{label('Observações')}<textarea className="form-input" rows={3} value={form.observacao} onChange={e=>set('observacao',e.target.value)}/></>)}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar AET'}
          </button>
        </div>
      </form>
    </div>
  )
}
