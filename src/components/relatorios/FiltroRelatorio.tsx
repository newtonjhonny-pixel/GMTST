'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'

type Empresa = { id: string; razaoSocial: string }

export function FiltroRelatorio() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  useEffect(() => { fetch('/api/empresas').then(r => r.json()).then(setEmpresas) }, [])

  const empresaId = sp.get('empresaId') ?? ''
  const ano       = sp.get('ano') ?? String(new Date().getFullYear())

  function update(key: string, val: string) {
    const params = new URLSearchParams(sp.toString())
    if (val) params.set(key, val); else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const anos = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i))

  return (
    <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>Empresa</label>
        <select
          className="form-select"
          style={{ minWidth: 220, fontSize: 13 }}
          value={empresaId}
          onChange={e => update('empresaId', e.target.value)}
        >
          <option value="">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.5px', textTransform: 'uppercase' }}>Ano</label>
        <select
          className="form-select"
          style={{ minWidth: 100, fontSize: 13 }}
          value={ano}
          onChange={e => update('ano', e.target.value)}
        >
          {anos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'transparent', letterSpacing: '.5px' }}>.</label>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2"
          style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <Printer size={13} /> Imprimir
        </button>
      </div>
    </div>
  )
}
