'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovaComunicacaoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId:'', unidadeId:'', tipo:'DSSMA', titulo:'', data:'',
    local:'', responsavel:'', duracao:'', participantes:'', conteudo:'',
  })

  useEffect(() => { fetch('/api/empresas').then(r=>r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r=>r.json()).then(setUnidades)
    setForm(f=>({...f, unidadeId:''}))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))

  const TITULO_SUGESTOES: Record<string, string[]> = {
    DSSMA: ['DSSMA — Segurança no Trabalho','DSSMA — Uso Correto de EPIs','DSSMA — Prevenção de Acidentes','DSSMA — Ordem e Limpeza'],
    PALESTRA: ['Palestra — Saúde Mental no Trabalho','Palestra — Prevenção de LER/DORT','Palestra — Combate ao Incêndio'],
    INFORMATIVO: ['Informativo — Uso de EPI Obrigatório','Informativo — Prevenção de Acidente','Informativo — Saúde Ocupacional'],
    CAMPANHA: ['Campanha SIPAT','Campanha Janeiro Branco','Campanha Outubro Rosa','Campanha Novembro Azul'],
    REUNIAO_SST: ['Reunião de SST Mensal','Reunião de Análise de Acidente','Reunião de CIPAA'],
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/tst/comunicacoes', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/comunicacoes')
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
          <h1 className="text-xl font-extrabold" style={{color:'var(--text-primary)',letterSpacing:'-.3px'}}>Novo Registro de Comunicação SST</h1>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>DSSMA, palestras, informativos, campanhas e reuniões</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:24,boxShadow:'var(--shadow-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 20px'}}>
            {field(<>{label('Empresa',true)}<select className="form-select" value={form.empresaId} onChange={e=>set('empresaId',e.target.value)} required><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade')}<select className="form-select" value={form.unidadeId} onChange={e=>set('unidadeId',e.target.value)} disabled={!form.empresaId}><option value="">Todas as unidades</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Tipo',true)}<select className="form-select" value={form.tipo} onChange={e=>set('tipo',e.target.value)} required>
              <option value="DSSMA">DSSMA</option>
              <option value="PALESTRA">Palestra</option>
              <option value="INFORMATIVO">Informativo</option>
              <option value="CAMPANHA">Campanha</option>
              <option value="REUNIAO_SST">Reunião SST</option>
            </select></>)}
            {field(<>{label('Data',true)}<input className="form-input" type="date" value={form.data} onChange={e=>set('data',e.target.value)} required/></>)}
            {field(<>{label('Título',true)}<select className="form-select" value={form.titulo} onChange={e=>set('titulo',e.target.value)} required>
              <option value="">Selecione ou escreva abaixo...</option>
              {(TITULO_SUGESTOES[form.tipo]??[]).map(t=><option key={t} value={t}>{t}</option>)}
              <option value="__custom">Outro (escrever livremente)</option>
            </select></>, 2)}
            {(form.titulo==='__custom'||!Object.values(TITULO_SUGESTOES).flat().includes(form.titulo)) && form.titulo &&
              field(<>{label('Título personalizado',true)}<input className="form-input" placeholder="Digite o título..." value={form.titulo==='__custom'?'':form.titulo} onChange={e=>set('titulo',e.target.value)} required/></>, 2)}
            {field(<>{label('Local')}<input className="form-input" placeholder="Sala, área, online..." value={form.local} onChange={e=>set('local',e.target.value)}/></>)}
            {field(<>{label('Responsável')}<input className="form-input" placeholder="Quem conduziu" value={form.responsavel} onChange={e=>set('responsavel',e.target.value)}/></>)}
            {field(<>{label('Duração (min)')}<input className="form-input" type="number" min="1" placeholder="Ex: 30" value={form.duracao} onChange={e=>set('duracao',e.target.value)}/></>)}
            {field(<>{label('Nº de Participantes')}<input className="form-input" type="number" min="0" placeholder="0" value={form.participantes} onChange={e=>set('participantes',e.target.value)}/></>)}
            {field(<>{label('Conteúdo / Pauta')}<textarea className="form-input" rows={3} placeholder="Resumo do conteúdo abordado..." value={form.conteudo} onChange={e=>set('conteudo',e.target.value)}/></>, 2)}
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
