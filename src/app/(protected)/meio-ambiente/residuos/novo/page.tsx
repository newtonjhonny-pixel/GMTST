'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { DocumentManager, DocumentManagerHandle } from '@/components/anexos/DocumentManager'
import { CATEGORIAS_DOCUMENTO_PADRAO } from '@/lib/anexos-categorias'

type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }
type Coletora = { id: string; razaoSocial: string }

const CLASSIFICACOES = ['Perigoso', 'Não Perigoso — Não Inerte', 'Não Perigoso — Inerte', 'Reciclável', 'Reutilizável']

export default function NovoResiduoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [coletoras, setColetoras] = useState<Coletora[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const docsRef = useRef<DocumentManagerHandle>(null)
  const [form, setForm] = useState({
    empresaId: '', unidadeId: '', descricao: '', tipoResiduo: '', classificacao: '',
    codigoIBAMA: '', classeRisco: '', origem: '', setorGerador: '',
    quantidade: '', unidadeMedida: 'kg', peso: '', formaArmazenamento: '',
    dataGeracao: '', dataColeta: '', dataDestinacao: '',
    destinacao: '', empresaColetora: '', coletorId: '', responsavel: '',
    situacao: 'GERADO', mtr: '', certificadoDest: '', observacao: '',
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
      const res = await fetch('/api/meio-ambiente/residuos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setLoading(false); return }

      if (docsRef.current?.hasPending()) {
        const ok = await docsRef.current.commitPendingUploads(data.id)
        if (!ok) setErro('Registro salvo, mas houve falha ao enviar um ou mais documentos.')
      }

      router.push(`/meio-ambiente/residuos/${data.id}`)
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
  const sectionTitle = (txt: string) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>{txt}</p>
  )

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Registro de Resíduo</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Controle de geração, coleta, destinação e MTR</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {sectionTitle('Localização')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Empresa', true)}<select className="form-select" value={form.empresaId} onChange={e => set('empresaId', e.target.value)} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}</select></>)}
            {field(<>{label('Unidade', true)}<select className="form-select" value={form.unidadeId} onChange={e => set('unidadeId', e.target.value)} required disabled={!form.empresaId}><option value="">Selecione...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}</select></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {sectionTitle('Identificação do Resíduo')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Descrição', true)}<input className="form-input" placeholder="Ex: Óleo lubrificante usado..." value={form.descricao} onChange={e => set('descricao', e.target.value)} required /></>, 2)}
            {field(<>{label('Tipo de Resíduo')}<input className="form-input" placeholder="Ex: Óleo, Sucata, Lodo..." value={form.tipoResiduo} onChange={e => set('tipoResiduo', e.target.value)} /></>)}
            {field(<>{label('Classificação')}<select className="form-select" value={form.classificacao} onChange={e => set('classificacao', e.target.value)}>
              <option value="">Selecione...</option>
              {CLASSIFICACOES.map(c => <option key={c} value={c}>{c}</option>)}
            </select></>)}
            {field(<>{label('Classe do Resíduo')}<select className="form-select" value={form.classeRisco} onChange={e => set('classeRisco', e.target.value)}>
              <option value="">Selecione...</option>
              <option value="Classe I — Perigoso">Classe I — Perigoso</option>
              <option value="Classe II A — Não inerte">Classe II A — Não inerte</option>
              <option value="Classe II B — Inerte">Classe II B — Inerte</option>
            </select></>)}
            {field(<>{label('Código do Resíduo (IBAMA)')}<input className="form-input" placeholder="Ex: 13 02 06" value={form.codigoIBAMA} onChange={e => set('codigoIBAMA', e.target.value)} /></>)}
            {field(<>{label('Origem')}<input className="form-input" placeholder="Ex: Processo produtivo, Manutenção..." value={form.origem} onChange={e => set('origem', e.target.value)} /></>)}
            {field(<>{label('Setor Gerador')}<input className="form-input" placeholder="Ex: Manutenção, Almoxarifado..." value={form.setorGerador} onChange={e => set('setorGerador', e.target.value)} /></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {sectionTitle('Quantidade e Armazenamento')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Quantidade', true)}<input className="form-input" type="number" step="0.01" min="0" value={form.quantidade} onChange={e => set('quantidade', e.target.value)} required /></>)}
            {field(<>{label('Unidade de Medida', true)}<select className="form-select" value={form.unidadeMedida} onChange={e => set('unidadeMedida', e.target.value)}>
              <option value="kg">kg</option>
              <option value="t">t (toneladas)</option>
              <option value="L">L (litros)</option>
              <option value="m³">m³</option>
              <option value="unidade">unidade</option>
            </select></>)}
            {field(<>{label('Peso')}<input className="form-input" type="number" step="0.01" min="0" value={form.peso} onChange={e => set('peso', e.target.value)} /></>)}
            {field(<>{label('Forma de Armazenamento')}<input className="form-input" placeholder="Ex: Tambores, Big bag, Baia..." value={form.formaArmazenamento} onChange={e => set('formaArmazenamento', e.target.value)} /></>, 3)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {sectionTitle('Datas e Situação')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Data de Geração', true)}<input className="form-input" type="date" value={form.dataGeracao} onChange={e => set('dataGeracao', e.target.value)} required /></>)}
            {field(<>{label('Data da Coleta')}<input className="form-input" type="date" value={form.dataColeta} onChange={e => set('dataColeta', e.target.value)} /></>)}
            {field(<>{label('Data da Destinação')}<input className="form-input" type="date" value={form.dataDestinacao} onChange={e => set('dataDestinacao', e.target.value)} /></>)}
            {field(<>{label('Situação')}<select className="form-select" value={form.situacao} onChange={e => set('situacao', e.target.value)}>
              <option value="GERADO">Gerado</option>
              <option value="AGUARDANDO_COLETA">Aguardando Coleta</option>
              <option value="COLETADO">Coletado</option>
              <option value="DESTINADO">Destinado</option>
            </select></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {sectionTitle('Destinação e Documentação')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Destinação Final', true)}<input className="form-input" placeholder="Ex: Coprocessamento, Aterro industrial..." value={form.destinacao} onChange={e => set('destinacao', e.target.value)} required /></>, 2)}
            {field(<>{label('Empresa Coletora (cadastrada)')}<select className="form-select" value={form.coletorId} onChange={e => set('coletorId', e.target.value)}>
              <option value="">Nenhuma / não cadastrada</option>
              {coletoras.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
            </select></>)}
            {field(<>{label('Empresa Coletora (texto livre)')}<input className="form-input" placeholder="Se não estiver cadastrada acima" value={form.empresaColetora} onChange={e => set('empresaColetora', e.target.value)} /></>)}
            {field(<>{label('Responsável')}<input className="form-input" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Nº MTR')}<input className="form-input" placeholder="Manifesto de Transporte de Resíduos" value={form.mtr} onChange={e => set('mtr', e.target.value)} /></>)}
            {field(<>{label('Certificado de Destinação')}<input className="form-input" placeholder="Nº do certificado" value={form.certificadoDest} onChange={e => set('certificadoDest', e.target.value)} /></>, 2)}
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

      <DocumentManager ref={docsRef} entidade="CONTROLE_RESIDUO" tipos={CATEGORIAS_DOCUMENTO_PADRAO} titulo="Documentos" />
    </div>
  )
}
