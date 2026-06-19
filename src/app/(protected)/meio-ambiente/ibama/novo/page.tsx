'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoIbamaPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', numeroCTF: '', certificadoReg: '',
    validadeCR: '', periodoRAPP: '', dataEnvioRAPP: '', protocolo: '',
    responsavel: '', observacao: '', status: 'VIGENTE',
  })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
  }, [])

  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r => r.json()).then(setUnidades)
    setForm(f => ({ ...f, unidadeId: '' }))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/meio-ambiente/ibama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/ibama')
    else alert('Erro ao salvar registro IBAMA')
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

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Registro IBAMA</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>CTF, Certificado de Regularidade e RAPP</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Localização</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade')} <select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} disabled={!form.empresaId}><option value="">Selecione (opcional)...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Cadastro Técnico Federal (CTF)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Número do CTF')} <input className="form-input" placeholder="Nº de inscrição CTF" value={form.numeroCTF} onChange={e => set('numeroCTF', e.target.value)} /></>)}
            {field(<>{label('Certificado de Regularidade')} <input className="form-input" placeholder="Nº do Certificado" value={form.certificadoReg} onChange={e => set('certificadoReg', e.target.value)} /></>)}
            {field(<>{label('Validade do CR')} <input className="form-input" type="date" value={form.validadeCR} onChange={e => set('validadeCR', e.target.value)} /></>)}
            {field(<>{label('Protocolo')} <input className="form-input" placeholder="Nº do protocolo" value={form.protocolo} onChange={e => set('protocolo', e.target.value)} /></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>RAPP — Relatório Anual</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Período de Referência')} <input className="form-input" placeholder="Ex: 2025, 2024/2025..." value={form.periodoRAPP} onChange={e => set('periodoRAPP', e.target.value)} /></>)}
            {field(<>{label('Data de Envio')} <input className="form-input" type="date" value={form.dataEnvioRAPP} onChange={e => set('dataEnvioRAPP', e.target.value)} /></>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Responsável')} <input className="form-input" placeholder="Nome do responsável" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Status')} <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="VIGENTE">Vigente</option>
              <option value="A_VENCER">A Vencer</option>
              <option value="VENCIDO">Vencido</option>
              <option value="CANCELADO">Cancelado</option>
            </select></>)}
            {field(<>{label('Observações')} <textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </form>
    </div>
  )
}
