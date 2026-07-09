'use client'
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { FileText, Upload, Eye, Download, RefreshCw, Trash2, History, X } from 'lucide-react'

type Anexo = {
  id: string
  nome: string
  tipo: string
  arquivoNome: string
  tamanho: number
  status: 'ATIVO' | 'INATIVO'
  versao: number
  observacao: string | null
  createdAt: string
  usuario: { name: string } | null
}

type PendingFile = {
  localId: string
  file: globalThis.File
  nome: string
  tipo: string
  observacao: string
}

export type AnexosPanelHandle = {
  /** Envia os documentos pendentes (adicionados antes de o registro existir) vinculando-os ao id informado. */
  commitPendingUploads: (entidadeId: string) => Promise<boolean>
  /** Indica se há documentos pendentes de envio (modo cadastro). */
  hasPending: () => boolean
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('pt-BR')
}

export const AnexosPanel = forwardRef<AnexosPanelHandle, { entidade: string; entidadeId?: string; tipos: string[] }>(
  function AnexosPanel({ entidade, entidadeId, tipos }, ref) {
    const modoCadastro = !entidadeId

    const [anexos, setAnexos] = useState<Anexo[]>([])
    const [pendentes, setPendentes] = useState<PendingFile[]>([])
    const [loading, setLoading] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState('')
    const [mostrarHistorico, setMostrarHistorico] = useState(false)
    const [substituindoId, setSubstituindoId] = useState<string | null>(null)

    const [form, setForm] = useState({ nome: '', tipo: tipos[0] ?? '', observacao: '' })
    const [arquivo, setArquivo] = useState<globalThis.File | null>(null)

    const carregar = useCallback(async () => {
      if (!entidadeId) { setLoading(false); return }
      setLoading(true)
      const res = await fetch(`/api/anexos?entidade=${entidade}&entidadeId=${entidadeId}${mostrarHistorico ? '&incluirInativos=1' : ''}`)
      const data = await res.json()
      setAnexos(Array.isArray(data) ? data : [])
      setLoading(false)
    }, [entidade, entidadeId, mostrarHistorico])

    useEffect(() => { carregar() }, [carregar])

    useImperativeHandle(ref, () => ({
      hasPending: () => pendentes.length > 0,
      async commitPendingUploads(novoEntidadeId: string) {
        let tudoOk = true
        for (const p of pendentes) {
          try {
            const fd = new FormData()
            fd.append('entidade', entidade)
            fd.append('entidadeId', novoEntidadeId)
            fd.append('nome', p.nome)
            fd.append('tipo', p.tipo)
            fd.append('observacao', p.observacao)
            fd.append('arquivo', p.file)
            const res = await fetch('/api/anexos', { method: 'POST', body: fd })
            if (res.ok) {
              setPendentes(prev => prev.filter(x => x.localId !== p.localId))
            } else {
              tudoOk = false
            }
          } catch {
            tudoOk = false
          }
        }
        return tudoOk
      },
    }), [pendentes, entidade])

    async function enviar(e: React.FormEvent) {
      e.preventDefault()
      setErro('')
      if (!arquivo) { setErro('Selecione um arquivo PDF.'); return }
      if (arquivo.type !== 'application/pdf') { setErro('Apenas arquivos PDF são aceitos.'); return }

      if (modoCadastro) {
        setPendentes(prev => [...prev, { localId: crypto.randomUUID(), file: arquivo, nome: form.nome, tipo: form.tipo, observacao: form.observacao }])
        setForm({ nome: '', tipo: tipos[0] ?? '', observacao: '' })
        setArquivo(null)
        const input = document.getElementById(`anexos-file-${entidade}`) as HTMLInputElement | null
        if (input) input.value = ''
        return
      }

      setEnviando(true)
      try {
        const fd = new FormData()
        fd.append('entidade', entidade)
        fd.append('entidadeId', entidadeId!)
        fd.append('nome', form.nome)
        fd.append('tipo', form.tipo)
        fd.append('observacao', form.observacao)
        fd.append('arquivo', arquivo)
        if (substituindoId) fd.append('substituiId', substituindoId)

        const res = await fetch('/api/anexos', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          setErro(data.error ?? 'Erro ao enviar documento')
        } else {
          setForm({ nome: '', tipo: tipos[0] ?? '', observacao: '' })
          setArquivo(null)
          setSubstituindoId(null)
          await carregar()
        }
      } catch {
        setErro('Erro de conexão ao enviar documento')
      } finally {
        setEnviando(false)
      }
    }

    function removerPendente(localId: string) {
      setPendentes(prev => prev.filter(p => p.localId !== localId))
    }

    async function inativar(id: string) {
      if (!confirm('Inativar este documento? Ele deixará de aparecer na lista principal, mas não será apagado do armazenamento.')) return
      await fetch(`/api/anexos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'INATIVO' }),
      })
      await carregar()
    }

    const label = (txt: string, req?: boolean) => (
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
        {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
    )

    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText size={16} /> Documentos
          </h2>
          {!modoCadastro && (
            <button
              type="button"
              onClick={() => setMostrarHistorico(v => !v)}
              className="flex items-center gap-1"
              style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}
            >
              <History size={12} />{mostrarHistorico ? 'Ocultar inativos' : 'Ver histórico (inativos)'}
            </button>
          )}
        </div>

        {modoCadastro && (
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Os documentos adicionados aqui serão enviados automaticamente assim que o cadastro for salvo.
          </p>
        )}

        <form onSubmit={enviar} className="mb-5" style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-alt)', border: '1px dashed var(--border)' }}>
          {erro && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
              {erro}
            </div>
          )}
          {substituindoId && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              Substituindo documento existente — a versão anterior será marcada como inativa.
              <button type="button" onClick={() => setSubstituindoId(null)} style={{ fontWeight: 700 }}>Cancelar</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {label('Nome do Documento', true)}
              <input className="form-input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: PGR assinado 2026" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {label('Tipo de Documento', true)}
              <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} required>
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: 'span 2' }}>
              {label('Arquivo PDF', true)}
              <input
                id={`anexos-file-${entidade}`}
                type="file"
                accept="application/pdf"
                className="form-input"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: 'span 2' }}>
              {label('Observação')}
              <input className="form-input" value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={enviando} className="flex items-center gap-2" style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? .7 : 1 }}>
              <Upload size={13} />{enviando ? 'Enviando...' : modoCadastro ? 'Adicionar Documento' : 'Enviar Documento'}
            </button>
          </div>
        </form>

        {modoCadastro ? (
          pendentes.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nenhum documento adicionado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendentes.map(p => (
                <div key={p.localId} className="flex items-center justify-between" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} style={{ color: 'var(--brand-from)', flexShrink: 0 }} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.nome} <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#d97706' }}>PENDENTE</span>
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {p.tipo} · {formatBytes(p.file.size)} · {p.file.name}
                      </p>
                      {p.observacao && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.observacao}</p>}
                    </div>
                  </div>
                  <button type="button" title="Remover" onClick={() => removerPendente(p.localId)} style={{ color: '#dc2626', flexShrink: 0, marginLeft: 10 }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carregando documentos...</p>
        ) : anexos.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nenhum documento anexado ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {anexos.map(a => (
              <div key={a.id} className="flex items-center justify-between" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', opacity: a.status === 'INATIVO' ? 0.55 : 1 }}>
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} style={{ color: 'var(--brand-from)', flexShrink: 0 }} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {a.nome} {a.versao > 1 && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>· v{a.versao}</span>}
                      {a.status === 'INATIVO' && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#dc2626' }}>INATIVO</span>}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {a.tipo} · {formatBytes(a.tamanho)} · {formatDate(a.createdAt)} {a.usuario ? `· ${a.usuario.name}` : ''}
                    </p>
                    {a.observacao && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.observacao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" style={{ marginLeft: 10 }}>
                  <a href={`/api/anexos/${a.id}/arquivo`} target="_blank" rel="noopener noreferrer" title="Visualizar" style={{ color: 'var(--text-secondary)' }}>
                    <Eye size={15} />
                  </a>
                  <a href={`/api/anexos/${a.id}/arquivo?download=1`} title="Baixar" style={{ color: 'var(--text-secondary)' }}>
                    <Download size={15} />
                  </a>
                  {a.status === 'ATIVO' && (
                    <>
                      <button type="button" title="Substituir" onClick={() => { setSubstituindoId(a.id); setForm({ nome: a.nome, tipo: a.tipo, observacao: '' }) }} style={{ color: 'var(--text-secondary)' }}>
                        <RefreshCw size={15} />
                      </button>
                      <button type="button" title="Inativar" onClick={() => inativar(a.id)} style={{ color: '#dc2626' }}>
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
