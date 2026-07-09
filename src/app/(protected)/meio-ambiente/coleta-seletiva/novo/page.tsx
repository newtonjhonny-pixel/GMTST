'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { DocumentManager, DocumentManagerHandle } from '@/components/anexos/DocumentManager'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Coletora = { id: string; razaoSocial: string }

const TIPOS_DOCUMENTO_COLETA = ['Relatórios', 'Fotografias', 'Comprovantes', 'Outros']

export default function NovoColetaSeletivaPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [coletoras, setColetoras] = useState<Coletora[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const docsRef = useRef<DocumentManagerHandle>(null)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', local: '', responsavel: '', frequencia: '',
    data: '', material: 'PAPEL', quantidade: '', peso: '', unidadeMedida: 'kg',
    destinacao: '', coletorId: '', observacao: '',
  })

  useEffect(() => {
    fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas)
    fetch('/api/meio-ambiente/coletoras').then(r => r.json()).then(setColetoras)
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
    setErro('')
    try {
      const res = await fetch('/api/meio-ambiente/coleta-seletiva', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setLoading(false); return }

      if (docsRef.current?.hasPending()) {
        const ok = await docsRef.current.commitPendingUploads(data.id)
        if (!ok) setErro('Registro salvo, mas houve falha ao enviar um ou mais documentos.')
      }

      router.push(`/meio-ambiente/coleta-seletiva/${data.id}`)
      router.refresh()
    } catch {
      setErro('Erro de conexão')
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
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Registro — Coleta Seletiva</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Registro de coleta de materiais recicláveis</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
            {field(<>{label('Local')}<input className="form-input" placeholder="Ex: Almoxarifado, Pátio..." value={form.local} onChange={e => set('local', e.target.value)} /></>)}
            {field(<>{label('Responsável')}<input className="form-input" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Frequência')}<input className="form-input" placeholder="Ex: Semanal, Quinzenal..." value={form.frequencia} onChange={e => set('frequencia', e.target.value)} /></>)}
            {field(<>{label('Data da Coleta', true)}<input className="form-input" type="date" value={form.data} onChange={e => set('data', e.target.value)} required /></>)}
            {field(<>{label('Material', true)}<select className="form-select" value={form.material} onChange={e => set('material', e.target.value)} required>
              <option value="PAPEL">Papel</option>
              <option value="PLASTICO">Plástico</option>
              <option value="VIDRO">Vidro</option>
              <option value="METAL">Metal</option>
              <option value="ORGANICO">Orgânico</option>
              <option value="MADEIRA">Madeira</option>
              <option value="ELETRONICO">Eletrônicos</option>
              <option value="PILHAS">Pilhas</option>
              <option value="LAMPADAS">Lâmpadas</option>
              <option value="REJEITO">Rejeito</option>
              <option value="OUTRO">Outro</option>
            </select></>)}
            {field(<>{label('Quantidade', true)}<input className="form-input" type="number" step="0.01" min="0" value={form.quantidade} onChange={e => set('quantidade', e.target.value)} required /></>)}
            {field(<>{label('Peso')}<input className="form-input" type="number" step="0.01" min="0" value={form.peso} onChange={e => set('peso', e.target.value)} /></>)}
            {field(<>{label('Unidade de Medida')}<select className="form-select" value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)}>
              <option value="kg">kg</option>
              <option value="ton">ton</option>
              <option value="L">Litros</option>
              <option value="un">Unidades</option>
              <option value="saco">Sacos</option>
            </select></>)}
            {field(<>{label('Destinação')}<input className="form-input" placeholder="Reciclagem, compostagem, aterro..." value={form.destinacao} onChange={e => set('destinacao', e.target.value)} /></>)}
            {field(<>{label('Empresa Coletora')}<select className="form-select" value={form.coletorId} onChange={e => set('coletorId', e.target.value)}>
              <option value="">Sem coletora vinculada</option>
              {coletoras.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
            </select></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
          {erro && <p className="text-sm font-medium mt-3" style={{ color: 'var(--danger)' }}>{erro}</p>}
        </div>
        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </form>

      <DocumentManager ref={docsRef} entidade="COLETA_SELETIVA" tipos={TIPOS_DOCUMENTO_COLETA} titulo="Documentos" />
    </div>
  )
}
