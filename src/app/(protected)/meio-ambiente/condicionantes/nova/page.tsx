'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

type Licenca = { id: string; tipo: string; orgao: string; numero: string | null; empresa: { razaoSocial: string } }

export default function NovaCondicionantePage() {
  const router = useRouter()
  const [licencas, setLicencas] = useState<Licenca[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    licencaId: '', descricao: '', prazo: '', periodicidade: '',
    responsavel: '', evidencia: '', status: 'PENDENTE', observacao: '',
  })

  useEffect(() => {
    fetch('/api/meio-ambiente/licencas').then(r => r.json()).then(setLicencas)
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/meio-ambiente/condicionantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) router.push('/meio-ambiente/condicionantes')
    else alert('Erro ao salvar condicionante')
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Nova Condicionante</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Condicionante vinculada a uma licença ambiental</p>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {field(<>{label('Licença Ambiental', true)}<select className="form-select" value={form.licencaId} onChange={e => set('licencaId', e.target.value)} required>
              <option value="">Selecione a licença...</option>
              {licencas.map(l => (
                <option key={l.id} value={l.id}>{l.tipo} — {l.orgao} · {l.empresa.razaoSocial}{l.numero ? ` (${l.numero})` : ''}</option>
              ))}
            </select></>, 2)}

            {field(<>{label('Descrição da Condicionante', true)}<textarea className="form-input" rows={3} placeholder="Descreva a obrigação ou condicionante..." value={form.descricao} onChange={e => set('descricao', e.target.value)} required /></>, 2)}

            {field(<>{label('Prazo / Data limite')} <input className="form-input" type="date" value={form.prazo} onChange={e => set('prazo', e.target.value)} /></>)}
            {field(<>{label('Periodicidade')} <input className="form-input" placeholder="Ex: Anual, Semestral, Mensal..." value={form.periodicidade} onChange={e => set('periodicidade', e.target.value)} /></>)}

            {field(<>{label('Responsável')} <input className="form-input" placeholder="Nome do responsável pelo cumprimento" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} /></>)}
            {field(<>{label('Status')} <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_DIA">Em dia</option>
              <option value="ATRASADA">Atrasada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select></>)}

            {field(<>{label('Evidência / Link')} <input className="form-input" placeholder="URL do documento ou evidência" value={form.evidencia} onChange={e => set('evidencia', e.target.value)} /></>, 2)}
            {field(<>{label('Observações')} <textarea className="form-input" rows={2} placeholder="Observações adicionais..." value={form.observacao} onChange={e => set('observacao', e.target.value)} /></>, 2)}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, border: 'none' }}>
            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Condicionante'}
          </button>
        </div>
      </form>
    </div>
  )
}
