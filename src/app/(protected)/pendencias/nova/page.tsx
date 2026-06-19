'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Usuario = { id: string; name: string }

export default function NovaPendenciaPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', responsavelId: '',
    descricao: '', origem: 'TST', prazo: '',
    prioridade: 'MEDIA', status: 'ABERTA', observacao: '',
  })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
    fetch('/api/usuarios').then(r => r.json()).then(setUsuarios).catch(() => {})
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
    const res = await fetch('/api/pendencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/pendencias')
    else alert('Erro ao salvar pendência')
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

  const PRIORIDADE_COLOR: Record<string, string> = {
    CRITICA: '#ef4444', ALTA: '#f97316', MEDIA: '#f59e0b', BAIXA: '#10b981',
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Pendência</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Plano de ação — tarefa com prazo e responsável</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade')}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} disabled={!form.empresaId}><option value="">Selecione (opcional)...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}

            {field(<>{label('Descrição', true)}<textarea className="form-input" rows={3} placeholder="Descreva a pendência ou ação necessária..." value={form.descricao} onChange={e => set('descricao', e.target.value)} required /></>, 2)}

            {field(<>{label('Origem', true)}<select className="form-select" value={form.origem} onChange={e => set('origem', e.target.value)} required>
              <option value="TST">TST — Segurança do Trabalho</option>
              <option value="MEIO_AMBIENTE">Meio Ambiente</option>
              <option value="CERTIFICACAO">Certificação</option>
              <option value="TAXA">Taxa / Pagamento</option>
              <option value="AUDITORIA">Auditoria</option>
              <option value="DOCUMENTO_LEGAL">Documento Legal</option>
            </select></>)}
            {field(<>{label('Prioridade', true)}<select className="form-select" value={form.prioridade} onChange={e => set('prioridade', e.target.value)} style={{ color: PRIORIDADE_COLOR[form.prioridade] ?? 'inherit', fontWeight: 700 }}>
              <option value="CRITICA">Crítica</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select></>)}

            {field(<>{label('Prazo', true)}<input className="form-input" type="date" value={form.prazo} onChange={e => set('prazo', e.target.value)} required /></>)}
            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ABERTA">Aberta</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select></>)}

            {field(<>{label('Responsável')}<select className="form-select" value={form.responsavelId} onChange={e => set('responsavelId', e.target.value)}>
              <option value="">Sem responsável</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select></>, 2)}

            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Pendência'}
          </button>
        </div>
      </form>
    </div>
  )
}
