'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface Empresa { id: string; razaoSocial: string }
interface Unidade { id: string; nome: string; empresaId: string }

export default function NovoLtcatPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [empresaId, setEmpresaId] = useState('')
  const [agentes, setAgentes] = useState<string[]>([])
  const [novoAgente, setNovoAgente] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (empresaId) fetch(`/api/unidades?empresaId=${empresaId}`).then(r => r.json()).then(setUnidades)
    else setUnidades([])
  }, [empresaId])

  function addAgente() {
    const a = novoAgente.trim()
    if (a && !agentes.includes(a)) { setAgentes(p => [...p, a]); setNovoAgente('') }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      empresaId:           fd.get('empresaId'),
      unidadeId:           fd.get('unidadeId'),
      responsavelTecnico:  fd.get('responsavelTecnico'),
      crea:                fd.get('crea') || null,
      art:                 fd.get('art') || null,
      dataEmissao:         fd.get('dataEmissao'),
      vigencia:            fd.get('vigencia') || null,
      ambientesAvaliados:  fd.get('ambientesAvaliados') || null,
      agentesNocivos:      agentes,
      status:              fd.get('status'),
      observacao:          fd.get('observacao') || null,
    }
    try {
      const res = await fetch('/api/sst/ltcat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erro ao salvar'); setSaving(false); return }
      router.push('/sst/ltcat')
      router.refresh()
    } catch { setError('Erro de conexão'); setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sst/ltcat" className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo LTCAT</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Laudo Técnico das Condições Ambientais do Trabalho</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Empresa *">
              <select name="empresaId" required value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="form-select">
                <option value="">Selecione...</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </FormField>
            <FormField label="Unidade *">
              <select name="unidadeId" required className="form-select" disabled={!empresaId}>
                <option value="">Selecione...</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Responsável Técnico *">
              <input name="responsavelTecnico" required placeholder="Nome do engenheiro" className="form-input" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CREA">
                <input name="crea" placeholder="Nº CREA" className="form-input" />
              </FormField>
              <FormField label="ART">
                <input name="art" placeholder="Nº ART" className="form-input" />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Data de Emissão *">
              <input name="dataEmissao" type="date" required className="form-input" />
            </FormField>
            <FormField label="Vigência">
              <input name="vigencia" type="date" className="form-input" />
            </FormField>
            <FormField label="Status">
              <select name="status" className="form-select" defaultValue="VIGENTE">
                <option value="VIGENTE">Vigente</option>
                <option value="A_VENCER">A Vencer</option>
                <option value="VENCIDO">Vencido</option>
                <option value="ARQUIVADO">Arquivado</option>
              </select>
            </FormField>
          </div>

          <FormField label="Ambientes Avaliados">
            <textarea name="ambientesAvaliados" rows={2} placeholder="Descreva os ambientes avaliados..." className="form-input" style={{ resize: 'vertical' }} />
          </FormField>

          <FormField label="Agentes Nocivos">
            <div className="flex gap-2 mb-2">
              <input
                value={novoAgente}
                onChange={e => setNovoAgente(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAgente() } }}
                placeholder="Ex: Ruído, Calor, Benzeno..."
                className="form-input flex-1"
              />
              <button type="button" onClick={addAgente} className="flex items-center gap-1 rounded-lg px-3 text-sm font-semibold" style={{ background: 'var(--brand-gradient)', color: '#fff' }}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {agentes.map(a => (
                <span key={a} className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>
                  {a}
                  <button type="button" onClick={() => setAgentes(p => p.filter(x => x !== a))}><X size={10} /></button>
                </span>
              ))}
            </div>
          </FormField>

          <FormField label="Observações">
            <textarea name="observacao" rows={2} placeholder="Observações adicionais..." className="form-input" style={{ resize: 'vertical' }} />
          </FormField>

          {error && <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Link href="/sst/ltcat" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)', opacity: saving ? .7 : 1 }}>
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar LTCAT'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}
