'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { DocumentManager, DocumentManagerHandle } from '@/components/anexos/DocumentManager'

const TIPOS_DOCUMENTO_EPI = ['Certificado do CA', 'Manual', 'Nota Fiscal', 'FISPQ', 'Outros']

type Empresa = { id: string; razaoSocial: string }

export default function NovoEstoqueEpiPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const docsRef = useRef<DocumentManagerHandle>(null)

  const [form, setForm] = useState({
    empresaId: '', codigoInterno: '', codigoBarras: '', nome: '', descricao: '',
    categoria: '', fabricante: '', modelo: '', ca: '', tipo: '', validade: '',
    tamanho: '', cor: '', unidadeMedida: 'UN', quantidadeEstoque: '0', estoqueMinimo: '0',
    localizacao: '', fornecedor: '', valorUnitario: '', lote: '', dataCompra: '', dataEntrada: '',
    status: 'ATIVO', observacoes: '',
  })

  useEffect(() => { fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas) }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/epis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setLoading(false); return }

      if (docsRef.current?.hasPending()) {
        const ok = await docsRef.current.commitPendingUploads(data.id)
        if (!ok) setErro('EPI salvo, mas houve falha ao enviar um ou mais documentos.')
      }

      router.push(`/tst/estoque-epi/${data.id}`)
      router.refresh()
    } catch {
      setErro('Erro de conexão ao salvar')
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
    <div style={{ maxWidth: 960 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo EPI no Estoque</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Cadastro mestre do equipamento — único ponto de entrada no catálogo</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Identificação</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required>
              <option value="">Selecione...</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
            </select></>)}
            {field(<>{label('Código Interno')}<input className="form-input" value={form.codigoInterno} onChange={e => set('codigoInterno', e.target.value)} /></>)}
            {field(<>{label('Código de Barras')}<input className="form-input" value={form.codigoBarras} onChange={e => set('codigoBarras', e.target.value)} /></>)}
            {field(<>{label('Nome / Descrição', true)}<input className="form-input" placeholder="Ex: Capacete de Segurança" value={form.nome} onChange={e => set('nome', e.target.value)} required /></>, 2)}
            {field(<>{label('Categoria')}<input className="form-input" placeholder="Ex: Proteção da Cabeça" value={form.categoria} onChange={e => set('categoria', e.target.value)} /></>)}
            {field(<>{label('Descrição Detalhada')}<textarea className="form-input" rows={2} value={form.descricao} onChange={e => set('descricao', e.target.value)} /></>, 3)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '18px 0 14px' }}>Certificado de Aprovação (CA)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Número do CA', true)}<input className="form-input" value={form.ca} onChange={e => set('ca', e.target.value)} required /></>)}
            {field(<>{label('Validade do CA')}<input className="form-input" type="date" value={form.validade} onChange={e => set('validade', e.target.value)} /></>)}
            {field(<>{label('Tipo (finalidade do EPI)', true)}<input className="form-input" placeholder="Ex: Proteção da Cabeça" value={form.tipo} onChange={e => set('tipo', e.target.value)} required /></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '18px 0 14px' }}>Características</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Fabricante')}<input className="form-input" value={form.fabricante} onChange={e => set('fabricante', e.target.value)} /></>)}
            {field(<>{label('Modelo')}<input className="form-input" value={form.modelo} onChange={e => set('modelo', e.target.value)} /></>)}
            {field(<>{label('Tamanho')}<input className="form-input" value={form.tamanho} onChange={e => set('tamanho', e.target.value)} /></>)}
            {field(<>{label('Cor')}<input className="form-input" value={form.cor} onChange={e => set('cor', e.target.value)} /></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '18px 0 14px' }}>Estoque</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Unidade de Medida')}<input className="form-input" placeholder="UN, PAR, CX..." value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)} /></>)}
            {field(<>{label('Quantidade Inicial em Estoque')}<input className="form-input" type="number" min="0" value={form.quantidadeEstoque} onChange={e => set('quantidadeEstoque', e.target.value)} /></>)}
            {field(<>{label('Estoque Mínimo')}<input className="form-input" type="number" min="0" value={form.estoqueMinimo} onChange={e => set('estoqueMinimo', e.target.value)} /></>)}
            {field(<>{label('Localização Física')}<input className="form-input" placeholder="Ex: Almoxarifado A - Prateleira 3" value={form.localizacao} onChange={e => set('localizacao', e.target.value)} /></>)}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', margin: '18px 0 14px' }}>Compra e Fornecimento</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Fornecedor')}<input className="form-input" value={form.fornecedor} onChange={e => set('fornecedor', e.target.value)} /></>)}
            {field(<>{label('Valor Unitário (R$)')}<input className="form-input" type="number" min="0" step="0.01" value={form.valorUnitario} onChange={e => set('valorUnitario', e.target.value)} /></>)}
            {field(<>{label('Lote')}<input className="form-input" value={form.lote} onChange={e => set('lote', e.target.value)} /></>)}
            {field(<>{label('Situação')}<select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select></>)}
            {field(<>{label('Data da Compra')}<input className="form-input" type="date" value={form.dataCompra} onChange={e => set('dataCompra', e.target.value)} /></>)}
            {field(<>{label('Data de Entrada')}<input className="form-input" type="date" value={form.dataEntrada} onChange={e => set('dataEntrada', e.target.value)} /></>)}
            {field(<>{label('Observações')}<textarea className="form-input" rows={2} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} /></>, 2)}
          </div>

          {erro && <p className="text-sm font-medium mt-3" style={{ color: 'var(--danger)' }}>{erro}</p>}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Documentos</p>
          <DocumentManager ref={docsRef} entidade="EPI" tipos={TIPOS_DOCUMENTO_EPI} titulo="Certificado, Manual, Nota Fiscal, FISPQ" />
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar EPI'}
          </button>
        </div>
      </form>
    </div>
  )
}
