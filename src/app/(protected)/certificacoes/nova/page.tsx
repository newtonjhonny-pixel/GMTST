'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovaCertificacaoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', tipo: '', orgaoCertificador: '',
    emissao: '', vencimento: '', responsavel: '',
    alertaDias: '30', status: 'VIGENTE', observacao: '',
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
    const res = await fetch('/api/certificacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/certificacoes')
    else alert('Erro ao salvar certificação')
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

  const TIPOS_CERT = [
    'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001',
    'OHSAS 18001', 'NBR 16001', 'SA 8000', 'FSC',
    'GreenBuilding LEED', 'PROCEL', 'Outro',
  ]

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Certificação</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>ISO, OHSAS, certificados de gestão e conformidade</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}

            {field(<>{label('Tipo de Certificação', true)}<select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
              <option value="">Selecione ou escreva...</option>
              {TIPOS_CERT.map(t => <option key={t} value={t}>{t}</option>)}
            </select></>)}
            {field(<>{label('Órgão Certificador', true)}<input className="form-input" placeholder="Ex: DNV GL, Bureau Veritas, ABNT..." value={form.orgaoCertificador} onChange={e => set('orgaoCertificador', e.target.value)} required /></>)}

            {field(<>{label('Data de Emissão')}<input className="form-input" type="date" value={form.emissao} onChange={e => set('emissao', e.target.value)} /></>)}
            {field(<>{label('Data de Vencimento', true)}<input className="form-input" type="date" value={form.vencimento} onChange={e => set('vencimento', e.target.value)} required /></>)}

            {field(<>{label('Responsável')}<input className="form-input" placeholder="Nome do gestor da certificação" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Alerta (dias antes)')}<select className="form-select" value={form.alertaDias} onChange={e => set('alertaDias', e.target.value)}>
              <option value="15">15 dias antes</option>
              <option value="30">30 dias antes</option>
              <option value="60">60 dias antes</option>
              <option value="90">90 dias antes</option>
            </select></>)}

            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="VIGENTE">Vigente</option>
              <option value="A_VENCER">A Vencer</option>
              <option value="VENCIDO">Vencida</option>
              <option value="CANCELADO">Cancelada</option>
              <option value="ARQUIVADO">Arquivada</option>
            </select></>, 2)}

            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Certificação'}
          </button>
        </div>
      </form>
    </div>
  )
}
