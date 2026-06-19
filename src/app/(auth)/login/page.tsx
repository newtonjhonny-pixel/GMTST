'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Efeito de fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600 opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500 opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Cabeçalho colorido */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-10 py-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                <Shield className="h-11 w-11 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">GMTST</h1>
            <p className="text-blue-200 text-base mt-2 font-medium">
              Gestão de TST e Meio Ambiente
            </p>
          </div>

          {/* Corpo do formulário */}
          <div className="px-10 py-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
              <p className="text-gray-500 text-sm mt-1">Informe suas credenciais para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4 pr-14 text-base text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeOff className="h-5 w-5" />
                      : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
              )}

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Entrar no Sistema'
                )}
              </button>
            </form>

            {/* Rodapé do card */}
            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs text-gray-400 leading-relaxed">
                Acesso restrito a usuários autorizados.<br />
                Em caso de problemas, contate o administrador do sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Versão */}
        <p className="mt-6 text-center text-xs text-white/40">
          GMTST v1.0 &nbsp;·&nbsp; Gestão de Segurança do Trabalho e Meio Ambiente
        </p>
      </div>
    </div>
  )
}
