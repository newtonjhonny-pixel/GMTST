'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoExtintorPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId:'', unidadeId:'', codigo:'', tipo:'PO_ABC', capacidade:'6kg',
    localizacao:'', setor:'', fabricacao:'', ultimaRecarga:'', proximaRecarga:'',
    ultimaInspecao:'', proximaInspecao:'', status:'ATIVO', observacao:'',
  })

  useEffect(() => { fetch('/api/empresas').then(r=>r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r=>r.json()).then(setUnidades)
    setForm(f=>({...f, unidadeId:''}))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/extintores', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/extintores')
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
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Cadastrar Extintor</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Controle de extintores de incêndio — NR-23</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={form.empresaId} onChange={e=>set('empresaId',e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade',true)}<select className="form-select" value={form.unidadeId} onChange={e=>set('unidadeId',e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Código / Nº de Identificação',true)}<input className="form-input" placeholder="Ex: EXT-001" value={form.codigo} onChange={e=>set('codigo',e.target.value)} required/></>)}
            {field(<>{label('Tipo',true)}<select className="form-select" value={form.tipo} onChange={e=>set('tipo',e.target.value)} required>
              <option value="PO_ABC">Pó ABC</option><option value="PO_BC">Pó BC</option>
              <option value="CO2">CO₂</option><option value="AGUA">Água</option>
              <option value="ESPUMA">Espuma</option><option value="HALONADO">Halonado</option>
            </select></>)}
            {field(<>{label('Capacidade',true)}<select className="form-select" value={form.capacidade} onChange={e=>set('capacidade',e.target.value)}>
              <option value="4kg">4 kg</option><option value="6kg">6 kg</option>
              <option value="9kg">9 kg</option><option value="12kg">12 kg</option>
              <option value="4L">4 L</option><option value="6L">6 L</option>
              <option value="10L">10 L</option><option value="75L">75 L (carrinho)</option>
              <option value="outro">Outro</option>
            </select></>)}
            {field(<>{label('Localização',true)}<input className="form-input" placeholder="Ex: Corredor principal, entrada" value={form.localizacao} onChange={e=>set('localizacao',e.target.value)} required/></>)}
            {field(<>{label('Setor')}<input className="form-input" placeholder="Produção, Escritório..." value={form.setor} onChange={e=>set('setor',e.target.value)}/></>)}
            {field(<>{label('Data de Fabricação')}<input className="form-input" type="date" value={form.fabricacao} onChange={e=>set('fabricacao',e.target.value)}/></>)}
            {field(<>{label('Última Recarga')}<input className="form-input" type="date" value={form.ultimaRecarga} onChange={e=>set('ultimaRecarga',e.target.value)}/></>)}
            {field(<>{label('Próxima Recarga',true)}<input className="form-input" type="date" value={form.proximaRecarga} onChange={e=>set('proximaRecarga',e.target.value)} required/></>)}
            {field(<>{label('Última Inspeção')}<input className="form-input" type="date" value={form.ultimaInspecao} onChange={e=>set('ultimaInspecao',e.target.value)}/></>)}
            {field(<>{label('Próxima Inspeção',true)}<input className="form-input" type="date" value={form.proximaInspecao} onChange={e=>set('proximaInspecao',e.target.value)} required/></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e=>set('observacao',e.target.value)}/></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar Extintor'}
          </button>
        </div>
      </form>
    </div>
  )
}
