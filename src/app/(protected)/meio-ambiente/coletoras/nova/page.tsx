'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { DocumentManager, DocumentManagerHandle } from '@/components/anexos/DocumentManager'

const TIPOS_RESIDUO_COMUNS = [
  'Classe I — Perigoso', 'Classe IIA — Não Inerte', 'Classe IIB — Inerte',
  'Resíduo Orgânico', 'Papel / Papelão', 'Plástico', 'Metal / Sucata',
  'Vidro', 'Eletrônico (REEE)', 'Óleo Lubrificante', 'Embalagem Contaminada',
  'Resíduo de Saúde (RSS)', 'Resíduo de Construção (RCC)', 'Pneumático',
]

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const TIPOS_DOCUMENTO_COLETORA = ['Licença Ambiental', 'Contrato', 'Certificados', 'Outros']

export default function NovaColetoraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [tiposResiduos, setTiposResiduos] = useState<string[]>([])
  const [customTipo, setCustomTipo] = useState('')
  const docsRef = useRef<DocumentManagerHandle>(null)
  const [form, setForm] = useState({
    razaoSocial: '', nomeFantasia: '', cnpj: '', telefone: '', email: '', responsavel: '',
    licencaAmbiental: '', numeroLicenca: '', validadeLicenca: '',
    endereco: '', municipio: '', estado: '', observacao: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleTipo = (t: string) => setTiposResiduos(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  const addCustom = () => {
    if (customTipo.trim() && !tiposResiduos.includes(customTipo.trim())) {
      setTiposResiduos(p => [...p, customTipo.trim()])
      setCustomTipo('')
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/meio-ambiente/coletoras', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tiposResiduos }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setLoading(false); return }

      if (docsRef.current?.hasPending()) {
        const ok = await docsRef.current.commitPendingUploads(data.id)
        if (!ok) setErro('Coletora salva, mas houve falha ao enviar um ou mais documentos.')
      }

      router.push(`/meio-ambiente/coletoras/${data.id}`)
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Empresa Coletora</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Transportadora, coletora ou destinadora de resíduos</p>
        </div>
      </div>
      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 14 }}>Dados da Empresa</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Razão Social', true)}<input className="form-input" value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} required /></>)}
            {field(<>{label('Nome Fantasia')}<input className="form-input" value={form.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} /></>)}
            {field(<>{label('CNPJ')}<input className="form-input" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => set('cnpj', e.target.value)} /></>)}
            {field(<>{label('Telefone')}<input className="form-input" value={form.telefone} onChange={e => set('telefone', e.target.value)} /></>)}
            {field(<>{label('E-mail')}<input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></>)}
            {field(<>{label('Responsável / Contato')}<input className="form-input" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 14 }}>Endereço</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Endereço')}<input className="form-input" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => set('endereco', e.target.value)} /></>)}
            {field(<>{label('Município')}<input className="form-input" value={form.municipio} onChange={e => set('municipio', e.target.value)} /></>)}
            {field(<>{label('Estado')}<select className="form-select" value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="">Selecione...</option>
              {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 14 }}>Licença Ambiental</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Tipo de Licença')}<input className="form-input" placeholder="Ex: LO, CTF/APP" value={form.licencaAmbiental} onChange={e => set('licencaAmbiental', e.target.value)} /></>)}
            {field(<>{label('Nº da Licença')}<input className="form-input" placeholder="Ex: LO-12345" value={form.numeroLicenca} onChange={e => set('numeroLicenca', e.target.value)} /></>)}
            {field(<>{label('Validade da Licença')}<input className="form-input" type="date" value={form.validadeLicenca} onChange={e => set('validadeLicenca', e.target.value)} /></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 14 }}>
            Tipos de Resíduos Aceitos ({tiposResiduos.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {TIPOS_RESIDUO_COMUNS.map(t => {
              const ativo = tiposResiduos.includes(t)
              return (
                <button key={t} type="button" onClick={() => toggleTipo(t)} style={{
                  padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: ativo ? '#16a34a' : 'var(--border)',
                  background: ativo ? '#f0fdf4' : 'var(--bg-card)',
                  color: ativo ? '#16a34a' : 'var(--text-secondary)',
                }}>
                  {ativo ? '✓ ' : ''}{t}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input" placeholder="Outro tipo de resíduo..."
              value={customTipo} onChange={e => setCustomTipo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={addCustom} style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Adicionar
            </button>
          </div>
          {tiposResiduos.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tiposResiduos.map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 600 }}>
                  {t}
                  <button type="button" onClick={() => toggleTipo(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', display: 'flex', padding: 0 }}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          {label('Observações')}
          <textarea className="form-input" rows={2} style={{ marginTop: 6 }} value={form.observacao} onChange={e => set('observacao', e.target.value)} />
          {erro && <p className="text-sm font-medium mt-3" style={{ color: 'var(--danger)' }}>{erro}</p>}
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Coletora'}
          </button>
        </div>
      </form>

      <DocumentManager ref={docsRef} entidade="EMPRESA_COLETORA" tipos={TIPOS_DOCUMENTO_COLETORA} titulo="Documentos" />
    </div>
  )
}
