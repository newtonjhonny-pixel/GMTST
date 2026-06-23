'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Colaborador = { id: string; nome: string; cpf: string; funcao: string }

export default function NovoAsoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState('')
  const [unidadeId, setUnidadeId] = useState('')
  const [form, setForm] = useState({
    colaboradorId: '', tipo: 'PERIODICO', dataExame: '', dataVencimento: '',
    resultado: 'APTO', medico: '', crm: '', observacao: '',
  })

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (!empresaId) { setUnidades([]); setUnidadeId(''); return }
    fetch(`/api/unidades?empresaId=${empresaId}`).then(r => r.json()).then(setUnidades)
    setUnidadeId('')
  }, [empresaId])
  useEffect(() => {
    if (!unidadeId) { setColaboradores([]); return }
    fetch(`/api/colaboradores?unidadeId=${unidadeId}`).then(r => r.json()).then(setColaboradores)
    setForm(f => ({ ...f, colaboradorId: '' }))
  }, [unidadeId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/tst/asos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/tst/asos')
    else alert('Erro ao salvar ASO')
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo ASO</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Atestado de Saúde Ocupacional</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Empresa', true)}<select className="form-select" value={empresaId} onChange={e => setEmpresaId(e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={unidadeId} onChange={e => setUnidadeId(e.target.value)} required disabled={!empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}

            {field(<>{label('Colaborador', true)}<select className="form-select" value={form.colaboradorId} onChange={e => set('colaboradorId', e.target.value)} required disabled={!unidadeId}>
              <option value="">Selecione...</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>)}
            </select></>, 2)}

            {field(<>{label('Tipo de Exame', true)}<select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
              <option value="ADMISSIONAL">Admissional</option>
              <option value="PERIODICO">Periódico</option>
              <option value="RETORNO">Retorno ao Trabalho</option>
              <option value="MUDANCA_RISCO">Mudança de Risco</option>
              <option value="DEMISSIONAL">Demissional</option>
            </select></>)}
            {field(<>{label('Resultado', true)}<select className="form-select" value={form.resultado} onChange={e => set('resultado', e.target.value)} required>
              <option value="APTO">Apto</option>
              <option value="INAPTO">Inapto</option>
              <option value="APTO_COM_RESTRICAO">Apto com Restrição</option>
            </select></>)}

            {field(<>{label('Data do Exame', true)}<input className="form-input" type="date" value={form.dataExame} onChange={e => set('dataExame', e.target.value)} required /></>)}
            {field(<>{label('Data de Vencimento')}<input className="form-input" type="date" value={form.dataVencimento} onChange={e => set('dataVencimento', e.target.value)} /></>)}

            {field(<>{label('Médico Responsável')}<input className="form-input" placeholder="Nome completo" value={form.medico} onChange={e => set('medico', e.target.value)} /></>)}
            {field(<>{label('CRM')}<input className="form-input" placeholder="CRM do médico" value={form.crm} onChange={e => set('crm', e.target.value)} /></>)}

            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar ASO'}
          </button>
        </div>
      </form>
    </div>
  )
}
