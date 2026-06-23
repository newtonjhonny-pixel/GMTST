'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'

type Cipa = { id: string; empresaId: string; empresa: { razaoSocial: string }; unidade: { nome: string } }
type Membro = { id: string; colaborador: { nome: string } }

export default function NovaReuniaoCipaaPage() {
  const router = useRouter()
  const { cipaId } = useParams<{ cipaId: string }>()
  const [cipa, setCipa] = useState<Cipa | null>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(false)
  const [presentes, setPresentes] = useState<string[]>([])
  const [form, setForm] = useState({
    data:'', tipo:'ORDINARIA', local:'', pauta:'', ata:'', aprovada:'false', observacao:'',
  })

  useEffect(() => {
    fetch('/api/tst/cipaa').then(r=>r.json()).then((cipaas: Cipa[]) => setCipa(cipaas.find(c=>c.id===cipaId) ?? null))
    fetch(`/api/tst/cipaa/membros?cipaId=${cipaId}`).then(r=>r.json()).then(setMembros)
  }, [cipaId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))
  const togglePresente = (nome: string) =>
    setPresentes(p => p.includes(nome) ? p.filter(n=>n!==nome) : [...p, nome])

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/cipaa/reunioes', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        ...form,
        cipaId,
        empresaId: cipa?.empresaId,
        presentes,
        aprovada: form.aprovada === 'true',
      }),
    })
    setLoading(false)
    if (res.ok) router.push(`/tst/cipaa/${cipaId}/reunioes`)
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
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Nova Reunião CIPAA</h1>
          {cipa && <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{cipa.empresa.razaoSocial} — {cipa.unidade.nome}</p>}
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:14}}>Dados da Reunião</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Data da Reunião',true)}<input className="form-input" type="date" value={form.data} onChange={e=>set('data',e.target.value)} required/></>)}
            {field(<>{label('Tipo',true)}<select className="form-select" value={form.tipo} onChange={e=>set('tipo',e.target.value)} required>
              <option value="ORDINARIA">Ordinária</option>
              <option value="EXTRAORDINARIA">Extraordinária</option>
            </select></>)}
            {field(<>{label('Local')}<input className="form-input" placeholder="Sala, auditório, online..." value={form.local} onChange={e=>set('local',e.target.value)}/></>, 2)}
            {field(<>{label('Pauta')}<textarea className="form-input" rows={3} placeholder="Assuntos a serem tratados..." value={form.pauta} onChange={e=>set('pauta',e.target.value)}/></>, 2)}
          </div>
        </div>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:14}}>Presentes ({presentes.length})</p>
          {membros.length > 0 ? (
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {membros.map(m => {
                const nome = m.colaborador.nome
                const ativo = presentes.includes(nome)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={()=>togglePresente(nome)}
                    style={{
                      padding:'6px 12px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',border:'1.5px solid',
                      borderColor: ativo ? '#16a34a' : 'var(--border)',
                      background: ativo ? '#f0fdf4' : 'var(--bg-card)',
                      color: ativo ? '#16a34a' : 'var(--text-secondary)',
                    }}
                  >
                    {ativo ? '✓ ' : ''}{nome}
                  </button>
                )
              })}
            </div>
          ) : (
            <p style={{fontSize:12,color:'var(--text-muted)'}}>Nenhum membro cadastrado. Adicione membros primeiro.</p>
          )}
          {presentes.length > 0 && (
            <div style={{marginTop:12,display:'flex',flexWrap:'wrap',gap:6}}>
              {presentes.map(n=>(
                <span key={n} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:20,background:'#e0f2fe',color:'#0369a1',fontSize:11,fontWeight:600}}>
                  {n}
                  <button type="button" onClick={()=>togglePresente(n)} style={{background:'none',border:'none',cursor:'pointer',color:'#0369a1',display:'flex',padding:0}}><X size={10}/></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:16,boxShadow:'var(--shadow-sm)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:14}}>Ata da Reunião</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            <div style={{gridColumn:'span 2',display:'flex',flexDirection:'column',gap:6}}>
              {label('Conteúdo da Ata')}
              <textarea className="form-input" rows={6} placeholder="Registro das deliberações, decisões e encaminhamentos da reunião..." value={form.ata} onChange={e=>set('ata',e.target.value)}/>
            </div>
            {field(<>{label('Ata Aprovada?')}<select className="form-select" value={form.aprovada} onChange={e=>set('aprovada',e.target.value)}>
              <option value="false">Não (pendente)</option>
              <option value="true">Sim, aprovada</option>
            </select></>)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={()=>router.back()} style={{padding:'8px 20px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{padding:'8px 20px',borderRadius:8,background:'var(--brand-gradient)',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,border:'none'}}>
            <Save size={14}/>{loading?'Salvando...':'Salvar Reunião'}
          </button>
        </div>
      </form>
    </div>
  )
}
