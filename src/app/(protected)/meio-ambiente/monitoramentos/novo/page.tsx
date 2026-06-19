'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoMonitoramentoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', tipo: 'EFLUENTE_LIQUIDO', parametro: '',
    resultado: '', unidadeMedida: '', limitePermitido: '', conformidade: '',
    dataColeta: '', dataProxima: '', laboratorio: '', responsavel: '', observacao: '',
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
    const payload = {
      ...form,
      conformidade: form.conformidade === '' ? null : form.conformidade === 'true',
    }
    const res = await fetch('/api/meio-ambiente/monitoramentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/monitoramentos')
    else alert('Erro ao salvar monitoramento')
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Monitoramento</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Registro de parâmetros ambientais monitorados</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Localização</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Dados do Monitoramento</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
            {field(<>{label('Tipo', true)}<select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
              <option value="EFLUENTE_LIQUIDO">Efluente Líquido</option>
              <option value="EMISSAO_ATMOSFERICA">Emissão Atmosférica</option>
              <option value="RUIDO_AMBIENTAL">Ruído Ambiental</option>
              <option value="AGUA_SUBTERRANEA">Água Subterrânea</option>
              <option value="SOLO">Solo</option>
              <option value="OUTRO">Outro</option>
            </select></>)}
            {field(<>{label('Parâmetro', true)}<input className="form-input" placeholder="Ex: DBO, DQO, pH, SO₂, dB(A)..." value={form.parametro} onChange={e => set('parametro', e.target.value)} required /></>)}
            {field(<>{label('Resultado')} <input className="form-input" placeholder="Valor obtido" value={form.resultado} onChange={e => set('resultado', e.target.value)} /></>)}
            {field(<>{label('Unidade de Medida')} <input className="form-input" placeholder="Ex: mg/L, dB, ppm..." value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)} /></>)}
            {field(<>{label('Limite Permitido')} <input className="form-input" placeholder="Ex: &lt; 200 mg/L" value={form.limitePermitido} onChange={e => set('limitePermitido', e.target.value)} /></>)}
            {field(<>{label('Conformidade')} <select className="form-select" value={form.conformidade} onChange={e => set('conformidade', e.target.value)}>
              <option value="">Não informado</option>
              <option value="true">Conforme</option>
              <option value="false">Não conforme</option>
            </select></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Datas e Responsáveis</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Data da Coleta', true)}<input className="form-input" type="date" value={form.dataColeta} onChange={e => set('dataColeta', e.target.value)} required /></>)}
            {field(<>{label('Próxima Coleta')} <input className="form-input" type="date" value={form.dataProxima} onChange={e => set('dataProxima', e.target.value)} /></>)}
            {field(<>{label('Laboratório')} <input className="form-input" placeholder="Nome do laboratório executor" value={form.laboratorio} onChange={e => set('laboratorio', e.target.value)} /></>)}
            {field(<>{label('Responsável')} <input className="form-input" placeholder="Nome do responsável" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Observações')} <textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Monitoramento'}
          </button>
        </div>
      </form>
    </div>
  )
}
