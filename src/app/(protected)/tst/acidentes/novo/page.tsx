'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }

export default function NovoAcidentePage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', data: '', local: '', descricao: '',
    tipologia: 'TIPICO', cat: 'false', numeroCat: '', dataCat: '',
    eSocial: 'false', eSocialProtocolo: '', diasPerdidos: '',
    investigacao: '', planoAcao: '', status: 'ABERTO',
  })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/tst/acidentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cat: form.cat === 'true', eSocial: form.eSocial === 'true' }),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/acidentes')
    else alert('Erro ao salvar acidente')
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

  const catRegistrado = form.cat === 'true'
  const eSocialEnviado = form.eSocial === 'true'

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Registrar Acidente</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Acidente de trabalho, trajeto ou doença ocupacional</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        {/* Dados do acidente */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>Ocorrência</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Data do Acidente', true)}<input className="form-input" type="date" value={form.data} onChange={e => set('data', e.target.value)} required /></>)}
            {field(<>{label('Local', true)}<input className="form-input" placeholder="Setor, área, endereço..." value={form.local} onChange={e => set('local', e.target.value)} required /></>)}
            {field(<>{label('Tipo', true)}<select className="form-select" value={form.tipologia} onChange={e => set('tipologia', e.target.value)} required>
              <option value="TIPICO">Típico</option>
              <option value="TRAJETO">Trajeto</option>
              <option value="DOENCA_OCUPACIONAL">Doença Ocupacional</option>
            </select></>)}
            {field(<>{label('Dias Perdidos')}<input className="form-input" type="number" min="0" placeholder="0" value={form.diasPerdidos} onChange={e => set('diasPerdidos', e.target.value)} /></>)}
            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ABERTO">Aberto</option>
              <option value="EM_INVESTIGACAO">Em Investigação</option>
              <option value="CONCLUIDO">Concluído</option>
            </select></>)}
            {field(<>{label('Descrição do Acidente', true)}<textarea className="form-input" rows={3} placeholder="Descreva como ocorreu o acidente..." value={form.descricao} onChange={e => set('descricao', e.target.value)} required /></>, 2)}
          </div>
        </div>

        {/* CAT */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>CAT — Comunicação de Acidente de Trabalho</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('CAT emitida?')}<select className="form-select" value={form.cat} onChange={e => set('cat', e.target.value)}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select></>)}
            {catRegistrado && field(<>{label('Número da CAT')}<input className="form-input" placeholder="Ex: 1234567-2025" value={form.numeroCat} onChange={e => set('numeroCat', e.target.value)} /></>)}
            {catRegistrado && field(<>{label('Data de emissão da CAT')}<input className="form-input" type="date" value={form.dataCat} onChange={e => set('dataCat', e.target.value)} /></>)}
          </div>
        </div>

        {/* eSocial */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>eSocial — Evento S-2210</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Notificado no eSocial?')}<select className="form-select" value={form.eSocial} onChange={e => set('eSocial', e.target.value)}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select></>)}
            {eSocialEnviado && field(<>{label('Protocolo eSocial')}<input className="form-input" placeholder="Número do protocolo de envio" value={form.eSocialProtocolo} onChange={e => set('eSocialProtocolo', e.target.value)} /></>)}
          </div>
        </div>

        {/* Investigação */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>Investigação e Plano de Ação</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {label('Causas Identificadas')}
              <textarea className="form-input" rows={3} placeholder="Descreva as causas imediatas, básicas e raiz..." value={form.investigacao} onChange={e => set('investigacao', e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {label('Plano de Ação')}
              <textarea className="form-input" rows={3} placeholder="Medidas corretivas e preventivas..." value={form.planoAcao} onChange={e => set('planoAcao', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Registrar Acidente'}
          </button>
        </div>
      </form>
    </div>
  )
}
