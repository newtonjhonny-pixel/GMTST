'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { perfilSchema, type PerfilInput } from '@/lib/validations/usuario'
import { MODULOS_PERMISSAO } from '@/lib/permissions'

type PerfilExistente = {
  id: string
  nome: string
  descricao: string | null
  permissoes: string[]
  ativo: boolean
  totalUsuarios: number
}

export function PerfilForm({ perfil }: { perfil?: PerfilExistente }) {
  const router = useRouter()
  const [erroApi, setErroApi] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: perfil?.nome ?? '',
      descricao: perfil?.descricao ?? '',
      permissoes: perfil?.permissoes ?? [],
      ativo: perfil?.ativo ?? true,
    },
  })

  const permissoes = watch('permissoes')
  const ativo = watch('ativo')

  const toggle = (key: string) => {
    setValue('permissoes', permissoes.includes(key) ? permissoes.filter(p => p !== key) : [...permissoes, key], { shouldValidate: true })
  }
  const toggleCategoria = (keys: string[]) => {
    const todasMarcadas = keys.every(k => permissoes.includes(k))
    setValue('permissoes', todasMarcadas ? permissoes.filter(p => !keys.includes(p)) : Array.from(new Set([...permissoes, ...keys])), { shouldValidate: true })
  }

  async function onSubmit(data: PerfilInput) {
    setErroApi('')
    try {
      const url = perfil ? `/api/perfis/${perfil.id}` : '/api/perfis'
      const res = await fetch(url, {
        method: perfil ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setErroApi(json.error ?? 'Erro ao salvar perfil'); return }
      router.push('/admin/perfis')
      router.refresh()
    } catch {
      setErroApi('Erro de conexão')
    }
  }

  async function excluir() {
    if (!perfil) return
    if (!confirm(`Excluir o perfil "${perfil.nome}"? Esta ação não pode ser desfeita.`)) return
    setExcluindo(true)
    try {
      const res = await fetch(`/api/perfis/${perfil.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) { setErroApi(json.error ?? 'Erro ao excluir perfil'); setExcluindo(false); return }
      router.push('/admin/perfis')
      router.refresh()
    } catch {
      setErroApi('Erro de conexão')
      setExcluindo(false)
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
    <div style={{ maxWidth: 820 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
            {perfil ? `Editar Perfil — ${perfil.nome}` : 'Novo Perfil de Acesso'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Defina as permissões de acesso por módulo</p>
        </div>
        {perfil && (
          <button
            type="button" onClick={excluir} disabled={excluindo || perfil.totalUsuarios > 0}
            title={perfil.totalUsuarios > 0 ? 'Não é possível excluir: há usuários vinculados a este perfil' : 'Excluir perfil'}
            className="flex items-center gap-2"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: '1px solid var(--border)', background: '#fef2f2', color: '#dc2626', cursor: (excluindo || perfil.totalUsuarios > 0) ? 'not-allowed' : 'pointer', opacity: perfil.totalUsuarios > 0 ? .5 : 1 }}
          >
            <Trash2 size={14} />Excluir
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Nome do Perfil', true)}<input className="form-input" placeholder="Ex: Administrador, Analista, Técnico..." {...register('nome')} />{errors.nome && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.nome.message}</p>}</>)}
            {field(<>{label('Descrição')}<input className="form-input" placeholder="Breve descrição do perfil" {...register('descricao')} /></>)}
          </div>
          <label className="flex items-center gap-2 mt-4" style={{ cursor: 'pointer', width: 'fit-content' }}>
            <input type="checkbox" checked={ativo} onChange={e => setValue('ativo', e.target.checked)} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Perfil ativo</span>
          </label>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Permissões por Módulo ({permissoes.length})
            </p>
            {errors.permissoes && <p className="text-xs" style={{ color: '#ef4444' }}>{errors.permissoes.message}</p>}
          </div>

          {MODULOS_PERMISSAO.map(cat => {
            const keys = cat.itens.map(i => i.key)
            const todasMarcadas = keys.every(k => permissoes.includes(k))
            const algumaMarcada = keys.some(k => permissoes.includes(k))
            return (
              <div key={cat.categoria} style={{ marginBottom: 18 }}>
                <label className="flex items-center gap-2 mb-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={todasMarcadas}
                    ref={el => { if (el) el.indeterminate = algumaMarcada && !todasMarcadas }}
                    onChange={() => toggleCategoria(keys)}
                  />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{cat.categoria}</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginLeft: 24 }}>
                  {cat.itens.map(item => (
                    <label key={item.key} className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" checked={permissoes.includes(item.key)} onChange={() => toggle(item.key)} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}

          {erroApi && <p className="text-sm font-medium mt-3" style={{ color: 'var(--danger)' }}>{erroApi}</p>}
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? .7 : 1, border: 'none' }}>
            <Save size={14} />{isSubmitting ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </form>
    </div>
  )
}
