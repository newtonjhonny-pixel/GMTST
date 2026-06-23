'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Colaborador = { id: string; nome: string; cpf: string; funcao: string }

const RISCOS_COMUNS = [
  'Ruído', 'Calor', 'Vibração', 'Radiação não-ionizante', 'Poeiras',
  'Fumos metálicos', 'Vapores químicos', 'Agentes biológicos',
  'Esforço repetitivo', 'Postura inadequada', 'Trabalho em altura',
  'Risco elétrico', 'Risco de incêndio', 'Espaço confinado',
]

const EPIS_COMUNS = [
  'Capacete', 'Óculos de proteção', 'Protetor auricular', 'Luvas de segurança',
  'Botina com biqueira de aço', 'Cinto de segurança', 'Máscara PFF2',
  'Avental de raspa', 'Uniforme de alta visibilidade', 'Protetor facial',
]

export default function NovaOrdemServicoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [riscos, setRiscos] = useState<string[]>([])
  const [epis, setEpis] = useState<string[]>([])
  const [riscoCustom, setRiscoCustom] = useState('')
  const [epiCustom, setEpiCustom] = useState('')
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', colaboradorId: '',
    numero: '', setor: '', funcao: '', medidasControle: '',
    dataEmissao: '', dataRevisao: '', responsavel: '',
    assinado: 'false', observacao: '', status: 'ATIVO',
  })

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r => r.json()).then(setUnidades)
    setForm(f => ({ ...f, unidadeId: '', colaboradorId: '' }))
    setColaboradores([])
  }, [form.empresaId])
  useEffect(() => {
    if (!form.unidadeId) { setColaboradores([]); return }
    fetch(`/api/colaboradores?unidadeId=${form.unidadeId}`).then(r => r.json()).then(setColaboradores)
    setForm(f => ({ ...f, colaboradorId: '' }))
  }, [form.unidadeId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleRisco = (r: string) => setRiscos(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])
  const toggleEpi = (e: string) => setEpis(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e])
  const addCustomRisco = () => { if (riscoCustom.trim()) { toggleRisco(riscoCustom.trim()); setRiscoCustom('') } }
  const addCustomEpi = () => { if (epiCustom.trim()) { toggleEpi(epiCustom.trim()); setEpiCustom('') } }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/tst/ordens-servico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, riscos, epis, assinado: form.assinado === 'true' }),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/ordens-servico')
    else alert('Erro ao salvar Ordem de Serviço')
  }

  const label = (txt: string, req?: boolean) => (
    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
      {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
  )
  const field = (children: React.ReactNode, span?: number) => (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {children}
    </div>
  )

  const chipStyle = (sel: boolean) => ({
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${sel ? 'var(--brand-primary, #0ea5e9)' : 'var(--border)'}`,
    background: sel ? 'var(--brand-primary, #0ea5e9)' : 'var(--bg-card)',
    color: sel ? '#fff' : 'var(--text-secondary)',
  })

  return (
    <div style={{ maxWidth: 840 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Ordem de Serviço</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Conforme NR-1 — Disposições Gerais de SST</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        {/* Identificação */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>Identificação</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Número da OS', true)}<input className="form-input" placeholder="Ex: OS-001/2025" value={form.numero} onChange={e => set('numero', e.target.value)} required /></>)}
            {field(<>{label('Colaborador')}<select className="form-select" value={form.colaboradorId} onChange={e => set('colaboradorId', e.target.value)} disabled={!form.unidadeId}>
              <option value="">Todos / Geral</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>)}
            </select></>)}
            {field(<>{label('Setor')}<input className="form-input" placeholder="Setor ou área de trabalho" value={form.setor} onChange={e => set('setor', e.target.value)} /></>)}
            {field(<>{label('Função')}<input className="form-input" placeholder="Cargo ou função (deixe em branco para usar do colaborador)" value={form.funcao} onChange={e => set('funcao', e.target.value)} /></>)}
          </div>
        </div>

        {/* Riscos */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>Riscos Identificados</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {RISCOS_COMUNS.map(r => (
              <button key={r} type="button" style={chipStyle(riscos.includes(r))} onClick={() => toggleRisco(r)}>{r}</button>
            ))}
          </div>
          {riscos.filter(r => !RISCOS_COMUNS.includes(r)).map(r => (
            <span key={r} style={{ ...chipStyle(true), display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8, marginBottom: 8 }}>
              {r}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => toggleRisco(r)} />
            </span>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Adicionar risco específico..." value={riscoCustom} onChange={e => setRiscoCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomRisco())} />
            <button type="button" onClick={addCustomRisco} style={{ padding: '0 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* EPIs */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>EPIs Obrigatórios</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {EPIS_COMUNS.map(ep => (
              <button key={ep} type="button" style={chipStyle(epis.includes(ep))} onClick={() => toggleEpi(ep)}>{ep}</button>
            ))}
          </div>
          {epis.filter(ep => !EPIS_COMUNS.includes(ep)).map(ep => (
            <span key={ep} style={{ ...chipStyle(true), display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8, marginBottom: 8 }}>
              {ep}
              <X size={10} style={{ cursor: 'pointer' }} onClick={() => toggleEpi(ep)} />
            </span>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Adicionar EPI específico..." value={epiCustom} onChange={e => setEpiCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomEpi())} />
            <button type="button" onClick={addCustomEpi} style={{ padding: '0 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Controles e Datas */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>Medidas e Controle</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Data de Emissão', true)}<input className="form-input" type="date" value={form.dataEmissao} onChange={e => set('dataEmissao', e.target.value)} required /></>)}
            {field(<>{label('Data de Revisão')}<input className="form-input" type="date" value={form.dataRevisao} onChange={e => set('dataRevisao', e.target.value)} /></>)}
            {field(<>{label('Responsável pela emissão')}<input className="form-input" placeholder="Nome do técnico responsável" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Assinado pelo colaborador?')}<select className="form-select" value={form.assinado} onChange={e => set('assinado', e.target.value)}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select></>)}
            {field(<>{label('Medidas de Controle')}<textarea className="form-input" rows={3} placeholder="EPC, controles administrativos, procedimentos..." value={form.medidasControle} onChange={e => set('medidasControle', e.target.value)} /></>, 2)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Ordem de Serviço'}
          </button>
        </div>
      </form>
    </div>
  )
}
