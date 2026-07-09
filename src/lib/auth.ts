import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        let user
        try {
          user = await prisma.user.findUnique({ where: { email: parsed.data.email }, include: { perfil: true } })
        } catch {
          return null
        }

        if (!user || !user.password || !user.ativo) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          perfilId: user.perfilId,
          perfilNome: user.perfil?.nome ?? null,
          permissoes: user.perfil?.permissoes ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.perfilId = (user as any).perfilId
        token.perfilNome = (user as any).perfilNome
        token.permissoes = (user as any).permissoes
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).perfilId = token.perfilId
        ;(session.user as any).perfilNome = token.perfilNome
        ;(session.user as any).permissoes = token.permissoes
      }
      return session
    },
  },
})
