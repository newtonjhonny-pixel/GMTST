'use client'
import { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FileText, Upload, Eye, Download, RefreshCw, Trash2, Plus, X, History, MessageSquarePlus, UploadCloud } from 'lucide-react'
import { DataTable, Td, Tr, Pill } from '@/components/ui/data-table'

type Anexo = {
  id: string
  nome: string
  tipo: string
  arquivoNome: string
  tamanho: number
  mimeType?: string
  status: 'ATIVO' | 'INATIVO'
  versao: number
  observacao: string | null
  createdAt: string
  usuario: { name: string } | null
}

type Pendente = {
  localId: string
  file: File
  nome: string
  tipo: string
  observacao: string
}

export type DocumentManagerHandle = {
  /** Envia os documentos pendentes (adicionados antes de o registro existir), vinculando-os ao id informado. */
  commitPendingUploads: (entidadeId: string) => Promise<boolean>
  hasPending: () => boolean
}

const ACCEPT_ATTR = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/webp'
const OFFICE_MIME = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
function extensao(nome: string) {
  const m = nome.match(/\.([a-zA-Z0-9]+)$/)
  return m ? m[1].toUpperCase() : '—'
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ATIVO:    { bg: '#f0fdf4', text: '#16a34a', label: 'Ativo' },
  INATIVO:  { bg: '#f1f5f9', text: '#64748b', label: 'Inativo' },
  PENDENTE: { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
}

const COLS = [
  { key: 'nome',    label: 'Nome' },
  { key: 'tipo',    label: 'Categoria' },
  { key: 'formato', label: 'Formato',       width: '80px' },
  { key: 'tamanho', label: 'Tamanho',       width: '80px' },
  { key: 'data',    label: 'Data de Envio', width: '110px' },
  { key: 'usuario', label: 'Usuário',       width: '130px' },
  { key: 'status',  label: 'Status',        width: '85px' },
  { key: 'acoes',   label: '',              width: '140px' },
]

export const DocumentManager = forwardRef<DocumentManagerHandle, { entidade: string; entidadeId?: string; tipos: string[]; titulo?: string }>(
  function DocumentManager({ entidade, entidadeId, tipos, titulo }, ref) {
    const modoCadastro = !entidadeId

    const [anexos, setAnexos] = useState<Anexo[]>([])
    const [pendentes, setPendentes] = useState<Pendente[]>([])
    const [loading, setLoading] = useState(true)
    const [mostrarInativos, setMostrarInativos] = useState(false)
    const [arrastando, setArrastando] = useState(false)

    const [modalAberto, setModalAberto] = useState(false)
    const [substituindo, setSubstituindo] = useState<Anexo | null>(null)
    const [tipoLote, setTipoLote] = useState(tipos[0] ?? '')
    const [observacaoLote, setObservacaoLote] = useState('')
    const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([])
    const [enviando, setEnviando] = useState(false)
    const [progresso, setProgresso] = useState('')
    const [erro, setErro] = useState('')

    const [obsAberto, setObsAberto] = useState<Anexo | null>(null)
    const [obsTexto, setObsTexto] = useState('')
    const [salvandoObs, setSalvandoObs] = useState(false)

    const dropZoneRef = useRef<HTMLDivElement>(null)

    const carregar = useCallback(async () => {
      if (!entidadeId) { setLoading(false); return }
      setLoading(true)
      const res = await fetch(`/api/anexos?entidade=${entidade}&entidadeId=${entidadeId}${mostrarInativos ? '&incluirInativos=1' : ''}`)
      const data = await res.json()
      setAnexos(Array.isArray(data) ? data : [])
      setLoading(false)
    }, [entidade, entidadeId, mostrarInativos])

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
            if (res.ok) setPendentes(prev => prev.filter(x => x.localId !== p.localId))
            else tudoOk = false
          } catch {
            tudoOk = false
          }
        }
        return tudoOk
      },
    }), [pendentes, entidade])

    function abrirModalNovo() {
      setSubstituindo(null)
      setTipoLote(tipos[0] ?? '')
      setObservacaoLote('')
      setArquivosSelecionados([])
      setErro('')
      setModalAberto(true)
    }

    function abrirModalSubstituir(a: Anexo) {
      setSubstituindo(a)
      setTipoLote(a.tipo)
      setObservacaoLote('')
      setArquivosSelecionados([])
      setErro('')
      setModalAberto(true)
    }

    function adicionarArquivos(lista: FileList | File[]) {
      const novos = Array.from(lista)
      setErro('')
      setArquivosSelecionados(prev => substituindo ? [novos[0]] : [...prev, ...novos])
    }

    function removerArquivoSelecionado(idx: number) {
      setArquivosSelecionados(prev => prev.filter((_, i) => i !== idx))
    }

    function onDrop(e: React.DragEvent) {
      e.preventDefault()
      setArrastando(false)
      if (e.dataTransfer.files?.length) adicionarArquivos(e.dataTransfer.files)
    }

    function onPaste(e: React.ClipboardEvent) {
      const itens = Array.from(e.clipboardData.items)
      const imagens = itens.filter(i => i.type.startsWith('image/'))
      if (imagens.length === 0) return
      const arquivos: File[] = []
      for (const item of imagens) {
        const file = item.getAsFile()
        if (file) {
          const nomeArq = `imagem-colada-${Date.now()}.${file.type.split('/')[1] ?? 'png'}`
          arquivos.push(new File([file], nomeArq, { type: file.type }))
        }
      }
      if (arquivos.length) adicionarArquivos(arquivos)
    }

    async function enviar(e: React.FormEvent) {
      e.preventDefault()
      setErro('')
      if (arquivosSelecionados.length === 0) { setErro('Selecione ao menos um arquivo.') ; return }

      if (modoCadastro) {
        setPendentes(prev => [
          ...prev,
          ...arquivosSelecionados.map(file => ({
            localId: crypto.randomUUID(),
            file,
            nome: arquivosSelecionados.length === 1 ? (file.name.replace(/\.[^.]+$/, '') || file.name) : file.name.replace(/\.[^.]+$/, ''),
            tipo: tipoLote,
            observacao: observacaoLote,
          })),
        ])
        setModalAberto(false)
        return
      }

      setEnviando(true)
      try {
        let falhas = 0
        for (let i = 0; i < arquivosSelecionados.length; i++) {
          const file = arquivosSelecionados[i]
          setProgresso(arquivosSelecionados.length > 1 ? `Enviando ${i + 1} de ${arquivosSelecionados.length}...` : 'Enviando...')
          const fd = new FormData()
          fd.append('entidade', entidade)
          fd.append('entidadeId', entidadeId!)
          fd.append('nome', file.name.replace(/\.[^.]+$/, '') || file.name)
          fd.append('tipo', tipoLote)
          fd.append('observacao', observacaoLote)
          fd.append('arquivo', file)
          if (substituindo) fd.append('substituiId', substituindo.id)

          const res = await fetch('/api/anexos', { method: 'POST', body: fd })
          if (!res.ok) {
            falhas++
            const data = await res.json().catch(() => ({}))
            setErro(data.error ?? 'Erro ao enviar um dos documentos')
          }
        }
        if (falhas === 0) {
          setModalAberto(false)
          await carregar()
        } else {
          await carregar()
        }
      } catch {
        setErro('Erro de conexão ao enviar documento(s)')
      } finally {
        setEnviando(false)
        setProgresso('')
      }
    }

    function removerPendente(localId: string) {
      setPendentes(prev => prev.filter(p => p.localId !== localId))
    }

    async function inativar(id: string) {
      if (!confirm('Excluir este documento? A exclusão é lógica (o arquivo permanece armazenado e pode ser consultado no histórico), nunca apagada fisicamente.')) return
      await fetch(`/api/anexos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'INATIVO' }),
      })
      await carregar()
    }

    function abrirObservacao(a: Anexo) {
      setObsAberto(a)
      setObsTexto(a.observacao ?? '')
    }

    async function salvarObservacao() {
      if (!obsAberto) return
      setSalvandoObs(true)
      try {
        await fetch(`/api/anexos/${obsAberto.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ observacao: obsTexto }),
        })
        setObsAberto(null)
        await carregar()
      } finally {
        setSalvandoObs(false)
      }
    }

    const label = (txt: string, req?: boolean) => (
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
        {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
    )

    const totalVisivel = modoCadastro ? pendentes.length : anexos.length
    const contagemLabel = modoCadastro
      ? `${pendentes.length} documento${pendentes.length !== 1 ? 's' : ''} pendente${pendentes.length !== 1 ? 's' : ''} de envio`
      : `${anexos.filter(a => a.status === 'ATIVO').length} documento${anexos.filter(a => a.status === 'ATIVO').length !== 1 ? 's' : ''} ativo${anexos.filter(a => a.status === 'ATIVO').length !== 1 ? 's' : ''}`

    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText size={16} /> {titulo ?? 'Documentos'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{contagemLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {!modoCadastro && (
              <button
                type="button"
                onClick={() => setMostrarInativos(v => !v)}
                className="flex items-center gap-1"
                style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}
              >
                <History size={12} />{mostrarInativos ? 'Ocultar inativos' : 'Ver inativos'}
              </button>
            )}
            <button
              type="button"
              onClick={abrirModalNovo}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <Plus size={14} />
              Adicionar Documento
            </button>
          </div>
        </div>

        {modoCadastro && (
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Os documentos adicionados aqui serão enviados automaticamente assim que o cadastro for salvo.
          </p>
        )}

        <DataTable columns={COLS} rowCount={loading ? 1 : totalVisivel} empty={{ icon: '📄', message: loading ? 'Carregando...' : 'Nenhum documento anexado ainda.' }}>
          {!loading && modoCadastro && pendentes.map(p => (
            <Tr key={p.localId}>
              <Td bold>{p.nome}</Td>
              <Td muted>{p.tipo}</Td>
              <Td muted>{extensao(p.file.name)}</Td>
              <Td muted>{formatSize(p.file.size)}</Td>
              <Td muted>—</Td>
              <Td muted>—</Td>
              <Td><Pill color={STATUS_STYLE.PENDENTE.text} bg={STATUS_STYLE.PENDENTE.bg}>{STATUS_STYLE.PENDENTE.label}</Pill></Td>
              <Td>
                <button type="button" title="Remover" onClick={() => removerPendente(p.localId)} style={{ color: '#dc2626' }}>
                  <X size={14} />
                </button>
              </Td>
            </Tr>
          ))}

          {!loading && !modoCadastro && anexos.map(a => {
            const ss = STATUS_STYLE[a.status] ?? STATUS_STYLE.ATIVO
            const isOffice = a.mimeType ? OFFICE_MIME.includes(a.mimeType) : false
            return (
              <Tr key={a.id}>
                <Td bold>
                  {a.nome} {a.versao > 1 && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>· v{a.versao}</span>}
                  {a.observacao && <p className="font-normal" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{a.observacao}</p>}
                </Td>
                <Td muted>{a.tipo}</Td>
                <Td muted>{extensao(a.arquivoNome)}</Td>
                <Td muted>{formatSize(a.tamanho)}</Td>
                <Td muted>{formatDate(a.createdAt)}</Td>
                <Td muted>{a.usuario?.name ?? '—'}</Td>
                <Td><Pill color={ss.text} bg={ss.bg}>{ss.label}</Pill></Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <a href={`/api/anexos/${a.id}/arquivo`} target="_blank" rel="noopener noreferrer" title={isOffice ? 'Baixar para visualizar' : 'Visualizar (zoom/navegação no visualizador do navegador)'} style={{ color: 'var(--text-secondary)' }}>
                      <Eye size={14} />
                    </a>
                    <a href={`/api/anexos/${a.id}/arquivo?download=1`} title="Baixar" style={{ color: 'var(--text-secondary)' }}>
                      <Download size={14} />
                    </a>
                    <button type="button" title="Adicionar observação" onClick={() => abrirObservacao(a)} style={{ color: 'var(--text-secondary)' }}>
                      <MessageSquarePlus size={14} />
                    </button>
                    {a.status === 'ATIVO' && (
                      <>
                        <button type="button" title="Substituir" onClick={() => abrirModalSubstituir(a)} style={{ color: 'var(--text-secondary)' }}>
                          <RefreshCw size={14} />
                        </button>
                        <button type="button" title="Excluir" onClick={() => inativar(a.id)} style={{ color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            )
          })}
        </DataTable>

        {/* Modal: adicionar/substituir documento(s) */}
        <Dialog.Root open={modalAberto} onOpenChange={(v) => !v && setModalAberto(false)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,.5)' }} />
            <Dialog.Content
              className="fixed left-1/2 top-1/2 z-50"
              style={{
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: 560,
                maxHeight: '88vh',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                borderRadius: 14,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                <Dialog.Title className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {substituindo ? 'Substituir Documento' : 'Adicionar Documento(s)'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
                </Dialog.Close>
              </div>

              <form onSubmit={enviar}>
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {erro && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
                      {erro}
                    </div>
                  )}
                  {substituindo && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 600 }}>
                      A versão atual (&quot;{substituindo.nome}&quot;) será marcada como inativa e substituída por esta nova.
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {label('Categoria do Documento', true)}
                    <select className="form-select" value={tipoLote} onChange={e => setTipoLote(e.target.value)} required>
                      {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {label(substituindo ? 'Arquivo' : 'Arquivo(s)', true)}
                    <div
                      ref={dropZoneRef}
                      onDragOver={e => { e.preventDefault(); setArrastando(true) }}
                      onDragLeave={() => setArrastando(false)}
                      onDrop={onDrop}
                      onPaste={onPaste}
                      tabIndex={0}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl"
                      style={{
                        border: `2px dashed ${arrastando ? 'var(--brand-from)' : 'var(--border)'}`,
                        background: arrastando ? 'var(--bg-card-alt)' : 'transparent',
                        padding: '22px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                      onClick={() => document.getElementById('dm-file-input')?.click()}
                    >
                      <UploadCloud size={22} style={{ color: 'var(--text-muted)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Arraste arquivos aqui, cole uma imagem (Ctrl+V) ou clique para escolher
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP · até 15MB cada</p>
                      <input
                        id="dm-file-input"
                        type="file"
                        accept={ACCEPT_ATTR}
                        multiple={!substituindo}
                        style={{ display: 'none' }}
                        onChange={e => { if (e.target.files?.length) adicionarArquivos(e.target.files); e.target.value = '' }}
                      />
                    </div>

                    {arquivosSelecionados.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {arquivosSelecionados.map((f, idx) => (
                          <span key={idx} className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 20, background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            {f.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({formatSize(f.size)})</span>
                            <button type="button" onClick={() => removerArquivoSelecionado(idx)} style={{ display: 'flex', color: 'var(--text-muted)' }}><X size={11} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {label('Observação')}
                    <textarea className="form-input" rows={2} style={{ resize: 'vertical' }} value={observacaoLote} onChange={e => setObservacaoLote(e.target.value)} placeholder="Aplicada a todos os arquivos deste envio" />
                  </div>
                </div>

                <div className="flex justify-end gap-3" style={{ padding: '16px 22px', borderTop: '1px solid var(--border)' }}>
                  <Dialog.Close asChild>
                    <button type="button" style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button type="submit" disabled={enviando} className="flex items-center gap-2" style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? .7 : 1 }}>
                    <Upload size={13} />{enviando ? (progresso || 'Enviando...') : substituindo ? 'Substituir' : modoCadastro ? 'Adicionar' : `Enviar ${arquivosSelecionados.length > 1 ? `(${arquivosSelecionados.length})` : ''}`}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Modal: adicionar/editar observação */}
        <Dialog.Root open={!!obsAberto} onOpenChange={(v) => !v && setObsAberto(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,.5)' }} />
            <Dialog.Content
              className="fixed left-1/2 top-1/2 z-50"
              style={{ transform: 'translate(-50%, -50%)', width: '100%', maxWidth: 420, background: 'var(--bg-card)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <Dialog.Title className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Observação — {obsAberto?.nome}</Dialog.Title>
                <Dialog.Close asChild><button style={{ color: 'var(--text-muted)' }}><X size={16} /></button></Dialog.Close>
              </div>
              <div style={{ padding: 20 }}>
                <textarea className="form-input" rows={4} style={{ resize: 'vertical' }} value={obsTexto} onChange={e => setObsTexto(e.target.value)} placeholder="Escreva uma observação sobre este documento..." />
              </div>
              <div className="flex justify-end gap-3" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                <Dialog.Close asChild>
                  <button type="button" style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                </Dialog.Close>
                <button type="button" onClick={salvarObservacao} disabled={salvandoObs} style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: salvandoObs ? .7 : 1 }}>
                  {salvandoObs ? 'Salvando...' : 'Salvar Observação'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    )
  }
)
