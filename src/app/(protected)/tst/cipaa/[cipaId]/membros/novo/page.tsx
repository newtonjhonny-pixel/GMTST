'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Colaborador = { id: string; nome: string; cpf: string; funcao: string; setor: string }
type Cipa = { id: string; empresa: { razaoSocial: string }; unidade: { nome: string } }

export default function NovoMembroCipaaPage() {
  const router = useRouter()
  const { cipaId } = useParams<{ cipaId: string }>()
  const [cipa, setCipa] = useState<Cipa | null>(null)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    colaboradorId:'', cargo:'MEMBRO_EFETIVO', representacao:'EMPREGADO', dataPosse:'',
  })

  useEffect(() => {
    fetch('/api/tst/cipaa').then(r=>r.json()).then((cipaas: Cipa[]) => {
      setCipa(cipaas.find(c=>c.id===cipaId) ?? null)
    })
    fetch('/api/colaboradores').then(r=>r.json()).then(setColaboradores)
  }, [cipaId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/cipaa/membros', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, cipaId }),
    })
    setLoading(false)
    if (res.ok) router.push(`/tst/cipaa/${cipaId}/membros`)
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
    <div style={{maxWidth:580}}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>router.back()} style={{color:'var(--text-muted)',display:'flex',alignItems:'center'}}><ArrowLeft size={16}/></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Adicionar Membro à CIPAA</h1>
          {cipa && <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{cipa.empresa.razaoSocial} — {cipa.unidade.nome}</p>}
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Colaborador',true)}<select className="form-select" value={form.colaboradorId} onChange={e=>set('colaboradorId',e.target.value)} required>
              <option value="">Selecione...</option>
              {colaboradores.map(c=><option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>)}
            </select></>, 2)}
            {field(<>{label('Cargo na CIPAA',true)}<select className="form-select" value={form.cargo} onChange={e=>set('cargo',e.target.value)} required>
              <option value="PRESIDENTE">Presidente</option>
              <option value="VICE_PRESIDENTE">Vice-Presidente</option>
              <option value="SECRETARIO">Secretário(a)</option>
              <option value="MEMBRO_EFETIVO">Membro Efetivo</option>
              <option value="MEMBRO_SUPLENTE">Membro Suplente</option>
            </select></>)}
            {field(<>{label('Representação',true)}<select className="form-select" value={form.representacao} onChange={e=>set('representacao',e.target.value)} required>
              <option value="EMPREGADO">Empregado (eleito)</option>
              <option value="EMPREGADOR">Empregador (designado)</option>
            </select></>)}
            {field(<>{label('Data de Posse')}<input className="form-input" type="date" value={form.dataPosse} onChange={e=>set('dataPosse',e.target.value)}/></>, 2)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Adicionar Membro'}
          </button>
        </div>
      </form>
    </div>
  )
}
