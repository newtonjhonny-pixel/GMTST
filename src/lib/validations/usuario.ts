import { z } from 'zod'

export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número')

export const criarUsuarioSchema = z
  .object({
    name: z.string().min(2, 'Informe o nome completo'),
    email: z.string().email('E-mail inválido'),
    password: senhaSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    perfilId: z.string().min(1, 'Selecione um perfil'),
    empresaId: z.string().optional(),
    unidadeId: z.string().optional(),
    ativo: z.boolean(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>

export const editarUsuarioSchema = z.object({
  name: z.string().min(2, 'Informe o nome completo'),
  email: z.string().email('E-mail inválido'),
  perfilId: z.string().min(1, 'Selecione um perfil'),
  empresaId: z.string().optional(),
  unidadeId: z.string().optional(),
  ativo: z.boolean(),
})

export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>

export const alterarSenhaSchema = z
  .object({
    password: senhaSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>

export const perfilSchema = z.object({
  nome: z.string().min(2, 'Informe o nome do perfil'),
  descricao: z.string().optional(),
  permissoes: z.array(z.string()).min(1, 'Selecione ao menos uma permissão'),
  ativo: z.boolean(),
})

export type PerfilInput = z.infer<typeof perfilSchema>
