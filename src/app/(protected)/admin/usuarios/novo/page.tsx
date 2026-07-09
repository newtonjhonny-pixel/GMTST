'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { criarUsuarioSchema, type CriarUsuarioInput } from '@/lib/validations/usuario'

type Perfil = { id: string; nome: string; descricao: string | null }
type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [erroApi, setErroApi] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<CriarUsuarioInput>({
    resolver: zodResolver(criarUsuarioSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', perfilId: '', empresaId: '', unidadeId: '', ativo: true },
  })

  const empresaId = watch('empresaId')
  const ativo = watch('ativo')

  useEffect(() => {
    fetch('/api/perfis').then(r => r.json()).then(setPerfis)
    fetch('/api/empresas?all=1').then(r => r.json()).then(setEmpresas)
  }, [])

  useEffect(() => {
    if (!empresaId) { setUnidades([]); return }
    fetch(`/api/unidades?empresaId=${empresaId}`).then(r => r.json()).then(setUnidades)
    setValue('unidadeId', '')
  }, [empresaId, setValue])

  async function onSubmit(data: CriarUsuarioInput) {
    setErroApi('')
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setErroApi(json.error ?? 'Erro ao criar usuário'); return }
      router.push('/admin/usuarios')
      router.refresh()
    } catch {
      setErroApi('Erro de conexão')
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
  const erro = (msg?: string) => msg && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{msg}</p>

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>Novo Usuário</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Criação de acesso ao sistema com perfil de permissões</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Dados de Acesso</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Nome Completo', true)}<input className="form-input" {...register('name')} />{erro(errors.name?.message)}</>, 2)}
            {field(<>{label('E-mail', true)}<input className="form-input" type="email" placeholder="usuario@empresa.com.br" {...register('email')} />{erro(errors.email?.message)}</>, 2)}

            {field(<>{label('Senha', true)}
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={verSenha ? 'text' : 'password'} style={{ paddingRight: 36 }} {...register('password')} />
                <button type="button" onClick={() => setVerSenha(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  {verSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {erro(errors.password?.message)}
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mínimo 8 caracteres, com maiúscula, minúscula e número</p>
            </>)}
            {field(<>{label('Confirmar Senha', true)}
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={verConfirmar ? 'text' : 'password'} style={{ paddingRight: 36 }} {...register('confirmPassword')} />
                <button type="button" onClick={() => setVerConfirmar(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  {verConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {erro(errors.confirmPassword?.message)}
            </>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Perfil e Vínculo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Perfil de Acesso', true)}<select className="form-select" {...register('perfilId')}>
              <option value="">Selecione...</option>
              {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>{erro(errors.perfilId?.message)}</>, 2)}
            {field(<>{label('Empresa (opcional)')}<select className="form-select" {...register('empresaId')}>
              <option value="">Nenhuma / acesso a todas</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
            </select></>)}
            {field(<>{label('Unidade (opcional)')}<select className="form-select" disabled={!empresaId} {...register('unidadeId')}>
              <option value="">Nenhuma / acesso a todas</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}
            </select></>)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Status</p>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer', width: 'fit-content' }}>
            <input type="checkbox" checked={ativo} onChange={e => setValue('ativo', e.target.checked)} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Usuário ativo (pode fazer login imediatamente)</span>
          </label>
          {erroApi && <p className="text-sm font-medium mt-3" style={{ color: 'var(--danger)' }}>{erroApi}</p>}
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? .7 : 1, border: 'none' }}>
            <Save size={14} />{isSubmitting ? 'Salvando...' : 'Salvar Usuário'}
          </button>
        </div>
      </form>
    </div>
  )
}
