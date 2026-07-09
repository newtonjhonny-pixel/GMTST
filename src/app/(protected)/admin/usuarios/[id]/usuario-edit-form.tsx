'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Eye, EyeOff, KeyRound, Power, PowerOff } from 'lucide-react'
import {
  editarUsuarioSchema, type EditarUsuarioInput,
  alterarSenhaSchema, type AlterarSenhaInput,
} from '@/lib/validations/usuario'

type Perfil = { id: string; nome: string }
type Empresa = { id: string; razaoSocial: string }
type Unidade = { id: string; nome: string; cidade: string; uf: string }

type Usuario = {
  id: string; name: string; email: string; role: string; ativo: boolean
  perfilId: string | null; empresaId: string | null; unidadeId: string | null
  perfilNome: string | null
}

const label = (txt: string, req?: boolean) => (
  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
    {txt}{req && <span style={{ color: '#ef4444' }}> *</span>}
  </label>
)
const field = (children: React.ReactNode, span?: number) => (
  <div style={{ gridColumn: span ? `span ${span}` : undefined, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
)
const erroMsg = (msg?: string) => msg && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{msg}</p>

export function UsuarioEditForm({ usuario, perfis, empresas, unidadesIniciais }: {
  usuario: Usuario; perfis: Perfil[]; empresas: Empresa[]; unidadesIniciais: Unidade[]
}) {
  const router = useRouter()
  const [unidades, setUnidades] = useState<Unidade[]>(unidadesIniciais)
  const [erroApi, setErroApi] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [ativo, setAtivo] = useState(usuario.ativo)
  const [alterandoStatus, setAlterandoStatus] = useState(false)

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<EditarUsuarioInput>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      name: usuario.name, email: usuario.email,
      perfilId: usuario.perfilId ?? '', empresaId: usuario.empresaId ?? '', unidadeId: usuario.unidadeId ?? '',
      ativo: usuario.ativo,
    },
  })
  const empresaId = watch('empresaId')

  const {
    register: registerSenha, handleSubmit: handleSubmitSenha, reset: resetSenha,
    formState: { errors: errosSenha, isSubmitting: enviandoSenha },
  } = useForm<AlterarSenhaInput>({ resolver: zodResolver(alterarSenhaSchema) })
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [senhaMsg, setSenhaMsg] = useState('')

  useEffect(() => {
    if (!empresaId) { setUnidades([]); return }
    if (empresaId === usuario.empresaId) { setUnidades(unidadesIniciais); return }
    fetch(`/api/unidades?empresaId=${empresaId}`).then(r => r.json()).then(list => {
      setUnidades(list)
      setValue('unidadeId', '')
    })
  }, [empresaId, setValue, usuario.empresaId, unidadesIniciais])

  async function onSubmit(data: EditarUsuarioInput) {
    setErroApi(''); setSucesso('')
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ativo }),
      })
      const json = await res.json()
      if (!res.ok) { setErroApi(json.error ?? 'Erro ao salvar'); return }
      setSucesso('Dados atualizados com sucesso.')
      router.refresh()
    } catch {
      setErroApi('Erro de conexão')
    }
  }

  async function onSubmitSenha(data: AlterarSenhaInput) {
    setSenhaMsg('')
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}/senha`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setSenhaMsg(json.error ?? 'Erro ao alterar senha'); return }
      setSenhaMsg('Senha alterada com sucesso.')
      resetSenha({ password: '', confirmPassword: '' })
    } catch {
      setSenhaMsg('Erro de conexão')
    }
  }

  async function alternarStatus() {
    setAlterandoStatus(true)
    setErroApi('')
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      })
      const json = await res.json()
      if (!res.ok) { setErroApi(json.error ?? 'Erro ao alterar status'); setAlterandoStatus(false); return }
      setAtivo(json.ativo)
      setValue('ativo', json.ativo)
      router.refresh()
    } finally {
      setAlterandoStatus(false)
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>{usuario.name}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ativo ? '#f0fdf4' : '#f8fafc', color: ativo ? '#16a34a' : '#64748b' }}>
              {ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{usuario.email} {usuario.perfilNome ? `· ${usuario.perfilNome}` : ''}</p>
        </div>
        <button
          type="button" onClick={alternarStatus} disabled={alterandoStatus}
          className="flex items-center gap-2"
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: alterandoStatus ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', background: ativo ? '#fef2f2' : '#f0fdf4', color: ativo ? '#dc2626' : '#16a34a' }}
        >
          {ativo ? <PowerOff size={14} /> : <Power size={14} />}
          {ativo ? 'Desativar' : 'Reativar'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Dados de Acesso</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Nome Completo', true)}<input className="form-input" {...register('name')} />{erroMsg(errors.name?.message)}</>, 2)}
            {field(<>{label('E-mail', true)}<input className="form-input" type="email" {...register('email')} />{erroMsg(errors.email?.message)}</>, 2)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Perfil e Vínculo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Perfil de Acesso', true)}<select className="form-select" {...register('perfilId')}>
              <option value="">Selecione...</option>
              {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>{erroMsg(errors.perfilId?.message)}</>, 2)}
            {field(<>{label('Empresa (opcional)')}<select className="form-select" {...register('empresaId')}>
              <option value="">Nenhuma / acesso a todas</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
            </select></>)}
            {field(<>{label('Unidade (opcional)')}<select className="form-select" disabled={!empresaId} {...register('unidadeId')}>
              <option value="">Nenhuma / acesso a todas</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.cidade}/{u.uf}</option>)}
            </select></>)}
          </div>
          {erroApi && <p className="text-sm font-medium mt-3" style={{ color: 'var(--danger)' }}>{erroApi}</p>}
          {sucesso && <p className="text-sm font-medium mt-3" style={{ color: '#16a34a' }}>{sucesso}</p>}
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? .7 : 1, border: 'none' }}>
            <Save size={14} />{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      <form onSubmit={handleSubmitSenha(onSubmitSenha)}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }} className="flex items-center gap-2">
            <KeyRound size={13} /> Alterar Senha
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            {field(<>{label('Nova Senha', true)}
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={verSenha ? 'text' : 'password'} style={{ paddingRight: 36 }} {...registerSenha('password')} />
                <button type="button" onClick={() => setVerSenha(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  {verSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {erroMsg(errosSenha.password?.message)}
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mínimo 8 caracteres, com maiúscula, minúscula e número</p>
            </>)}
            {field(<>{label('Confirmar Nova Senha', true)}
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={verConfirmar ? 'text' : 'password'} style={{ paddingRight: 36 }} {...registerSenha('confirmPassword')} />
                <button type="button" onClick={() => setVerConfirmar(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  {verConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {erroMsg(errosSenha.confirmPassword?.message)}
            </>)}
          </div>
          {senhaMsg && <p className="text-sm font-medium mt-3" style={{ color: senhaMsg.includes('sucesso') ? '#16a34a' : 'var(--danger)' }}>{senhaMsg}</p>}
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={enviandoSenha} className="flex items-center gap-2" style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, cursor: enviandoSenha ? 'not-allowed' : 'pointer' }}>
              <KeyRound size={14} />{enviandoSenha ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
