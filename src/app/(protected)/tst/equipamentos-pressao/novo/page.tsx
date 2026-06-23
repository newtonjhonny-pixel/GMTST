'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoEquipamentoPressaoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId:'', unidadeId:'', tag:'', tipo:'COMPRESSOR',
    fabricante:'', modelo:'', pressaoMaxima:'', localizacao:'',
    ultimaInspecao:'', proximaInspecao:'',
    responsavelTecnico:'', art:'', status:'ATIVO', observacao:'',
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
    const res = await fetch('/api/tst/equipamentos-pressao', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/equipamentos-pressao')
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
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Cadastrar Equipamento sob Pressão</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Caldeiras, vasos de pressão, compressores e tubulações — NR-13</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:14}}>Identificação</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={form.empresaId} onChange={e=>set('empresaId',e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade',true)}<select className="form-select" value={form.unidadeId} onChange={e=>set('unidadeId',e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Tag / Número de Identificação',true)}<input className="form-input" placeholder="Ex: NR13-001" value={form.tag} onChange={e=>set('tag',e.target.value)} required/></>)}
            {field(<>{label('Tipo',true)}<select className="form-select" value={form.tipo} onChange={e=>set('tipo',e.target.value)} required>
              <option value="COMPRESSOR">Compressor</option>
              <option value="VASO_PRESSAO">Vaso de Pressão</option>
              <option value="CALDEIRA">Caldeira</option>
              <option value="TUBULACAO">Tubulação</option>
            </select></>)}
            {field(<>{label('Fabricante')}<input className="form-input" value={form.fabricante} onChange={e=>set('fabricante',e.target.value)}/></>)}
            {field(<>{label('Modelo')}<input className="form-input" value={form.modelo} onChange={e=>set('modelo',e.target.value)}/></>)}
            {field(<>{label('Localização')}<input className="form-input" placeholder="Ex: Sala de máquinas, pátio..." value={form.localizacao} onChange={e=>set('localizacao',e.target.value)}/></>)}
            {field(<>{label('Pressão Máxima (kgf/cm²)')}<input className="form-input" type="number" step="0.01" min="0" value={form.pressaoMaxima} onChange={e=>set('pressaoMaxima',e.target.value)}/></>)}
          </div>
        </div>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:14}}>Inspeções e Testes — NR-13</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Última Inspeção')}<input className="form-input" type="date" value={form.ultimaInspecao} onChange={e=>set('ultimaInspecao',e.target.value)}/></>)}
            {field(<>{label('Próxima Inspeção',true)}<input className="form-input" type="date" value={form.proximaInspecao} onChange={e=>set('proximaInspecao',e.target.value)} required/></>)}
            {field(<>{label('Responsável Técnico (RT)')}<input className="form-input" placeholder="Nome e CREA/COREN" value={form.responsavelTecnico} onChange={e=>set('responsavelTecnico',e.target.value)}/></>)}
            {field(<>{label('Nº ART')}<input className="form-input" placeholder="Número da ART" value={form.art} onChange={e=>set('art',e.target.value)}/></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e=>set('observacao',e.target.value)}/></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar Equipamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
