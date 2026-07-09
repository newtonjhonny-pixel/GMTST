'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Colaborador = { id: string; nome: string; cpf: string }
type EPI = { id: string; nome: string; ca: string; tipo: string; validade: string | null; quantidadeEstoque: number; localizacao: string | null }

type ItemForm = {
  key: string
  epiId: string
  quantidade: string
  dataEntrega: string
  dataVencimento: string
  observacao: string
}

function novoItem(dataEntregaPadrao: string): ItemForm {
  return {
    key: Math.random().toString(36).slice(2),
    epiId: '', quantidade: '1', dataEntrega: dataEntregaPadrao, dataVencimento: '', observacao: '',
  }
}

export default function NovaFichaEpiPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [epis, setEpis] = useState<EPI[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', colaboradorId: '', dataEntrega: '', observacao: '',
  })
  const [itens, setItens] = useState<ItemForm[]>([novoItem('')])

  useEffect(() => {
    fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas)
  }, [])

  useEffect(() => {
    if (!form.empresaId) { setUnidades([]); setEpis([]); return }
    fetch(`/api/unidades?empresaId=${form.empresaId}`).then(r => r.json()).then(setUnidades)
    fetch(`/api/epis?empresaId=${form.empresaId}`).then(r => r.json()).then(setEpis).catch(() => setEpis([]))
    setForm(f => ({ ...f, unidadeId: '', colaboradorId: '' }))
    setItens([novoItem('')])
  }, [form.empresaId])

  useEffect(() => {
    if (!form.unidadeId) { setColaboradores([]); return }
    fetch(`/api/colaboradores?unidadeId=${form.unidadeId}`).then(r => r.json()).then(setColaboradores)
    setForm(f => ({ ...f, colaboradorId: '' }))
  }, [form.unidadeId])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const setItem = (key: string, k: keyof ItemForm, v: string) => {
    setItens(list => list.map(it => it.key === key ? { ...it, [k]: v } : it))
  }
  const addItem = () => setItens(list => [...list, novoItem(form.dataEntrega)])
  const removeItem = (key: string) => setItens(list => list.length > 1 ? list.filter(it => it.key !== key) : list)

  const epiInfo = (epiId: string) => epis.find(e => e.id === epiId)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (itens.some(it => !it.epiId)) {
      setErro('Selecione o EPI em todos os itens, ou remova os itens vazios.')
      return
    }
    for (const it of itens) {
      const info = epiInfo(it.epiId)
      const qtd = parseInt(it.quantidade) || 0
      if (info && qtd > info.quantidadeEstoque) {
        setErro('Quantidade insuficiente em estoque.')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/tst/fichas-epi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, itens }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Erro ao salvar ficha de entrega')
        setLoading(false)
        return
      }
      router.push(`/tst/epis/${data.id}`)
      router.refresh()
    } catch {
      setErro('Erro de conexão ao salvar ficha')
      setLoading(false)
    }
  }

  const label = (txt: string, req?: boolean) => (
    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
      {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
  )
  const field = (children: React.ReactNode, span?: number) => (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  )

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Ficha de Entrega de EPI</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Uma ficha por colaborador, com todos os itens entregues. Os EPIs vêm do cadastro de Estoque.</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Dados da Ficha</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required>
              <option value="">Selecione...</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
            </select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}>
              <option value="">Selecione...</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}
            </select></>)}
            {field(<>{label('Colaborador', true)}<select className="form-select" value={form.colaboradorId} onChange={e => set('colaboradorId', e.target.value)} required disabled={!form.unidadeId}>
              <option value="">Selecione...</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select></>)}
            {field(<>{label('Data da Entrega', true)}<input className="form-input" type="date" value={form.dataEntrega} onChange={e => set('dataEntrega', e.target.value)} required /></>)}
            {field(<>{label('Observações Gerais')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Itens de EPI ({itens.length})
            </p>
            <button type="button" onClick={addItem} disabled={!form.empresaId} className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, color: form.empresaId ? 'var(--brand-from)' : 'var(--text-muted)' }}>
              <Plus size={13} /> Adicionar EPI
            </button>
          </div>

          {!form.empresaId && (
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Selecione a empresa para listar os EPIs disponíveis no estoque.</p>
          )}

          {itens.map((item, idx) => {
            const info = epiInfo(item.epiId)
            const qtd = parseInt(item.quantidade) || 0
            const insuficiente = !!info && qtd > info.quantidadeEstoque
            return (
              <div key={item.key} className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-card-alt)', border: insuficiente ? '1px solid #fca5a5' : '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Item {idx + 1}</span>
                  {itens.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.key)} style={{ color: '#dc2626', display: 'flex' }} title="Remover item">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px 16px' }}>
                  {field(<>{label('EPI (do estoque)', true)}<select className="form-select" value={item.epiId} onChange={e => setItem(item.key, 'epiId', e.target.value)} required disabled={!form.empresaId}>
                    <option value="">Selecione...</option>
                    {epis.map(ep => <option key={ep.id} value={ep.id}>{ep.nome} (CA {ep.ca})</option>)}
                  </select></>)}
                  {field(<>{label('CA')}<input className="form-input" value={info?.ca ?? '—'} disabled /></>)}
                  {field(<>{label('Validade do CA')}<input className="form-input" value={info?.validade ? new Date(info.validade).toLocaleDateString('pt-BR') : '—'} disabled /></>)}

                  {field(<>{label('Quantidade Disponível')}<input className="form-input" value={info ? `${info.quantidadeEstoque} em estoque` : '—'} disabled /></>)}
                  {field(<>{label('Localização')}<input className="form-input" value={info?.localizacao ?? '—'} disabled /></>)}
                  {field(<>{label('Quantidade Entregue')}<input className="form-input" type="number" min="1" value={item.quantidade} onChange={e => setItem(item.key, 'quantidade', e.target.value)} /></>)}

                  {field(<>{label('Data de Entrega', true)}<input className="form-input" type="date" value={item.dataEntrega} onChange={e => setItem(item.key, 'dataEntrega', e.target.value)} required /></>)}
                  {field(<>{label('Prevista Troca/Devolução')}<input className="form-input" type="date" value={item.dataVencimento} onChange={e => setItem(item.key, 'dataVencimento', e.target.value)} /></>)}
                  {field(<>{label('Observação do item')}<input className="form-input" value={item.observacao} onChange={e => setItem(item.key, 'observacao', e.target.value)} /></>)}
                </div>
                {insuficiente && (
                  <p className="text-xs font-semibold mt-2" style={{ color: '#dc2626' }}>Quantidade insuficiente em estoque.</p>
                )}
              </div>
            )
          })}

          {erro && <p className="text-sm font-medium mt-2" style={{ color: 'var(--danger)' }}>{erro}</p>}
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Ficha'}
          </button>
        </div>
      </form>
    </div>
  )
}
