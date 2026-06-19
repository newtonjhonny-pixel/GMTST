'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Empresa { id: string; razaoSocial: string }
interface Unidade { id: string; nome: string; empresaId: string }
interface PGR { id: string; versao: string; unidadeId: string }

export default function NovoInventarioRiscoPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [pgrs, setPgrs] = useState<PGR[]>([])
  const [empresaId, setEmpresaId] = useState('')
  const [unidadeId, setUnidadeId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])
  useEffect(() => {
    if (empresaId) { fetch(`/api/unidades?empresaId=${empresaId}`).then(r => r.json()).then(setUnidades); setUnidadeId('') }
    else setUnidades([])
  }, [empresaId])
  useEffect(() => {
    if (unidadeId) fetch(`/api/sst/pgr?unidadeId=${unidadeId}`).then(r => r.json()).then(setPgrs)
    else setPgrs([])
  }, [unidadeId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      empresaId:         fd.get('empresaId'),
      unidadeId:         fd.get('unidadeId'),
      pgrId:             fd.get('pgrId') || null,
      ghe:               fd.get('ghe'),
      atividade:         fd.get('atividade'),
      agente:            fd.get('agente'),
      tipoRisco:         fd.get('tipoRisco'),
      fontePorVia:       fd.get('fontePorVia') || null,
      nivelAcao:         fd.get('nivelAcao') || null,
      limiteTolerancia:  fd.get('limiteTolerancia') || null,
      medicaoRealizada:  fd.get('medicaoRealizada') || null,
      medidasControle:   fd.get('medidasControle') || null,
      epc:               fd.get('epc') || null,
      epi:               fd.get('epi') || null,
      responsavel:       fd.get('responsavel') || null,
      status:            fd.get('status'),
    }
    try {
      const res = await fetch('/api/sst/inventario-riscos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erro ao salvar'); setSaving(false); return }
      router.push('/sst/inventario-riscos')
      router.refresh()
    } catch { setError('Erro de conexão'); setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sst/inventario-riscos" className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Item — Inventário de Riscos</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Identificação e avaliação de risco por GHE</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>

          {/* Localização */}
          <SectionTitle>Localização</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Empresa *">
              <select name="empresaId" required value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="form-select">
                <option value="">Selecione...</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </FormField>
            <FormField label="Unidade *">
              <select name="unidadeId" required value={unidadeId} onChange={e => setUnidadeId(e.target.value)} className="form-select" disabled={!empresaId}>
                <option value="">Selecione...</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </FormField>
            <FormField label="PGR Vinculado">
              <select name="pgrId" className="form-select" disabled={!unidadeId || pgrs.length === 0}>
                <option value="">Nenhum / Selecione...</option>
                {pgrs.map(p => <option key={p.id} value={p.id}>v{p.versao}</option>)}
              </select>
            </FormField>
          </div>

          {/* Identificação */}
          <SectionTitle>Identificação do Risco</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="GHE — Grupo Homogêneo de Exposição *">
              <input name="ghe" required placeholder="Ex: GHE-01 Produção" className="form-input" />
            </FormField>
            <FormField label="Atividade *">
              <input name="atividade" required placeholder="Atividade ou tarefa executada" className="form-input" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Agente *">
              <input name="agente" required placeholder="Ex: Ruído contínuo, Benzeno, Calor..." className="form-input" />
            </FormField>
            <FormField label="Tipo de Risco *">
              <select name="tipoRisco" required className="form-select">
                <option value="">Selecione...</option>
                <option value="FISICO">Físico</option>
                <option value="QUIMICO">Químico</option>
                <option value="BIOLOGICO">Biológico</option>
                <option value="ERGONOMICO">Ergonômico</option>
                <option value="ACIDENTE">Acidente</option>
              </select>
            </FormField>
          </div>
          <FormField label="Fonte Geradora / Via de Absorção">
            <input name="fontePorVia" placeholder="Ex: Prensa hidráulica / Via respiratória" className="form-input" />
          </FormField>

          {/* Avaliação */}
          <SectionTitle>Avaliação</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nível de Ação">
              <input name="nivelAcao" placeholder="Ex: 82 dB(A) / 0,5 ppm" className="form-input" />
            </FormField>
            <FormField label="Limite de Tolerância">
              <input name="limiteTolerancia" placeholder="Ex: 85 dB(A) / NR-15 Anexo 1" className="form-input" />
            </FormField>
          </div>
          <FormField label="Medição Realizada">
            <input name="medicaoRealizada" placeholder="Resultado da medição (laudo, data, valor)" className="form-input" />
          </FormField>

          {/* Controle */}
          <SectionTitle>Medidas de Controle</SectionTitle>
          <FormField label="Medidas de Controle (Hierarquia)">
            <textarea name="medidasControle" rows={3} placeholder="Eliminação → Substituição → Controle de engenharia → Administrativas → EPC → EPI" className="form-input" style={{ resize: 'vertical' }} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="EPC">
              <input name="epc" placeholder="Equipamento de Proteção Coletiva" className="form-input" />
            </FormField>
            <FormField label="EPI">
              <input name="epi" placeholder="Ex: Protetor auricular, respirador PFF2..." className="form-input" />
            </FormField>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Responsável">
              <input name="responsavel" placeholder="Responsável pela avaliação" className="form-input" />
            </FormField>
            <FormField label="Status">
              <select name="status" className="form-select" defaultValue="IDENTIFICADO">
                <option value="IDENTIFICADO">Identificado</option>
                <option value="AVALIADO">Avaliado</option>
                <option value="CONTROLADO">Controlado</option>
              </select>
            </FormField>
          </div>

          {error && <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Link href="/sst/inventario-riscos" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white" style={{ background: 'var(--brand-gradient)', opacity: saving ? .7 : 1 }}>
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{children}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
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
