'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

const NRS = [
  'NR-1 (Disposições Gerais)', 'NR-4 (SESMT)', 'NR-5 (CIPAA)',
  'NR-6 (EPI)', 'NR-7 (PCMSO)', 'NR-9 (Agentes Ambientais)',
  'NR-10 (Instalações Elétricas)', 'NR-11 (Transporte, Mov. e Armazenagem)',
  'NR-12 (Máquinas e Equipamentos)', 'NR-13 (Vasos sob Pressão)',
  'NR-15 (Atividades e Operações Insalubres)', 'NR-16 (Atividades Periculosas)',
  'NR-17 (Ergonomia)', 'NR-18 (Construção Civil)',
  'NR-20 (Inflamáveis e Combustíveis)', 'NR-23 (Proteção contra Incêndio)',
  'NR-26 (Sinalização)', 'NR-33 (Espaços Confinados)',
  'NR-35 (Trabalho em Altura)', 'NR-38 (Limpeza Urbana)',
  'Outro / Não se aplica',
]

export default function NovoTreinamentoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', nome: '', tipo: 'Treinamento NR',
    normaRegulamentadora: '', dataRealizacao: '', dataVencimento: '',
    cargaHoraria: '', instrutor: '', local: '', observacao: '', status: 'ATIVO',
  })

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r => r.json()).then(setUnidades)
    setForm(f => ({ ...f, unidadeId: '' }))
  }, [form.empresaId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/tst/treinamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/treinamentos')
    else alert('Erro ao salvar treinamento')
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
    <div style={{ maxWidth: 800 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Treinamento</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Treinamentos NR, integrações, palestras e capacitações</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}

            {field(<>{label('Nome do Treinamento', true)}<input className="form-input" placeholder="Ex: Trabalho em Altura — NR-35" value={form.nome} onChange={e => set('nome', e.target.value)} required /></>, 2)}

            {field(<>{label('Norma Regulamentadora', true)}<select className="form-select" value={form.normaRegulamentadora} onChange={e => set('normaRegulamentadora', e.target.value)} required>
              <option value="">Selecione a NR...</option>
              {NRS.map(nr => <option key={nr} value={nr}>{nr}</option>)}
            </select></>)}
            {field(<>{label('Tipo')}<select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option value="Treinamento NR">Treinamento NR</option>
              <option value="Integração">Integração</option>
              <option value="DSSMA">DSSMA</option>
              <option value="Palestra">Palestra</option>
              <option value="Informativo">Informativo</option>
              <option value="Reciclagem">Reciclagem</option>
              <option value="Outro">Outro</option>
            </select></>)}

            {field(<>{label('Data de Realização', true)}<input className="form-input" type="date" value={form.dataRealizacao} onChange={e => set('dataRealizacao', e.target.value)} required /></>)}
            {field(<>{label('Data de Vencimento')}<input className="form-input" type="date" value={form.dataVencimento} onChange={e => set('dataVencimento', e.target.value)} /></>)}

            {field(<>{label('Carga Horária (h)')}<input className="form-input" type="number" step="0.5" min="0" placeholder="Ex: 8" value={form.cargaHoraria} onChange={e => set('cargaHoraria', e.target.value)} /></>)}
            {field(<>{label('Instrutor / Empresa')}<input className="form-input" placeholder="Nome do instrutor ou empresa" value={form.instrutor} onChange={e => set('instrutor', e.target.value)} /></>)}

            {field(<>{label('Local')}<input className="form-input" placeholder="Onde foi realizado o treinamento" value={form.local} onChange={e => set('local', e.target.value)} /></>)}
            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ATIVO">Ativo</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select></>)}

            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Treinamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
