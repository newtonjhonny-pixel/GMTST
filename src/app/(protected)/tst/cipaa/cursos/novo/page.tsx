'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Colaborador = { id: string; nome: string; funcao: string }

export default function NovoCursoCipaaPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [unidadeId, setUnidadeId] = useState('')
  const [form, setForm] = useState({
    colaboradorId:'', dataCurso:'', cargaHoraria:'', instrutor:'',
    instituicao:'', validade:'', certificado:'', observacao:'',
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
    const res = await fetch('/api/tst/cipaa/cursos', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, empresaId }),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/cipaa/cursos')
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
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Registrar Curso NR-5</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Capacitação de cipeiro — mínimo 20h conforme NR-5</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={empresaId} onChange={e=>setEmpresaId(e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade',true)}<select className="form-select" value={unidadeId} onChange={e=>setUnidadeId(e.target.value)} required disabled={!empresaId}><option value="">Selecione...</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Cipeiro / Colaborador',true)}<select className="form-select" value={form.colaboradorId} onChange={e=>set('colaboradorId',e.target.value)} required disabled={!unidadeId}>
              <option value="">Selecione...</option>
              {colaboradores.map(c=><option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>)}
            </select></>, 2)}
            {field(<>{label('Data do Curso',true)}<input className="form-input" type="date" value={form.dataCurso} onChange={e=>set('dataCurso',e.target.value)} required/></>)}
            {field(<>{label('Carga Horária (h)')}<input className="form-input" type="number" min="1" placeholder="Ex: 20" value={form.cargaHoraria} onChange={e=>set('cargaHoraria',e.target.value)}/></>)}
            {field(<>{label('Instrutor')}<input className="form-input" placeholder="Nome do instrutor" value={form.instrutor} onChange={e=>set('instrutor',e.target.value)}/></>)}
            {field(<>{label('Instituição / Empresa Treinamento')}<input className="form-input" placeholder="Empresa ou entidade certificadora" value={form.instituicao} onChange={e=>set('instituicao',e.target.value)}/></>, 2)}
            {field(<>{label('Validade do Certificado')}<input className="form-input" type="date" value={form.validade} onChange={e=>set('validade',e.target.value)}/></>)}
            {field(<>{label('Nº do Certificado')}<input className="form-input" placeholder="Código ou número" value={form.certificado} onChange={e=>set('certificado',e.target.value)}/></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e=>set('observacao',e.target.value)}/></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar Curso'}
          </button>
        </div>
      </form>
    </div>
  )
}
