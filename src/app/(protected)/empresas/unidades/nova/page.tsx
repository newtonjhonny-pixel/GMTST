'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function NovaUnidadeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const empresaIdParam = searchParams.get('empresaId') ?? ''

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    empresaId: empresaIdParam, nome: '', cidade: '', uf: '',
    responsavelTST: '', responsavelMeioAmb: '', status: 'ATIVO',
  })

  useEffect(() => {
    fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas)
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/empresas/${form.empresaId}`)
      } else {
        setErro(data.error ?? 'Erro ao salvar unidade')
      }
    } catch {
      setErro('Erro de conexão ao salvar unidade')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Unidade</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Cadastro de unidade/filial vinculada a uma empresa</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          {erro && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
              {erro}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required>
              <option value="">Selecione...</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
            </select></>, 2)}

            {field(<>{label('Nome da Unidade', true)}<input className="form-input" placeholder="Ex: Matriz, Filial Campinas..." value={form.nome} onChange={e => set('nome', e.target.value)} required /></>, 2)}

            {field(<>{label('Cidade', true)}<input className="form-input" value={form.cidade} onChange={e => set('cidade', e.target.value)} required /></>)}
            {field(<>{label('UF', true)}<select className="form-select" value={form.uf} onChange={e => set('uf', e.target.value)} required>
              <option value="">Selecione...</option>
              {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select></>)}

            {field(<>{label('Responsável TST')}<input className="form-input" value={form.responsavelTST} onChange={e => set('responsavelTST', e.target.value)} /></>)}
            {field(<>{label('Responsável Meio Ambiente')}<input className="form-input" value={form.responsavelMeioAmb} onChange={e => set('responsavelMeioAmb', e.target.value)} /></>)}

            {field(<>{label('Status')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ATIVO">Ativa</option>
              <option value="INATIVO">Inativa</option>
              <option value="ARQUIVADO">Arquivada</option>
            </select></>)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Unidade'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NovaUnidadePage() {
  return (
    <Suspense fallback={null}>
      <NovaUnidadeForm />
    </Suspense>
  )
}
