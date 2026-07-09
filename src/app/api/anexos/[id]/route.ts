import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.status === 'ATIVO' || body.status === 'INATIVO') data.status = body.status
    if (body.observacao !== undefined) data.observacao = body.observacao
    if (body.nome !== undefined) data.nome = body.nome

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar.' }, { status: 400 })
    }

    const anterior = await prisma.documentoAnexo.findUnique({ where: { id } })
    const anexo = await prisma.documentoAnexo.update({ where: { id }, data })

    if (anterior) {
      let acao: string | null = null
      let descricao = ''
      if (data.status === 'INATIVO' && anterior.status !== 'INATIVO') {
        acao = 'EXCLUIR'
        descricao = `Documento "${anterior.nome}" excluído (exclusão lógica)`
      } else if (data.status === 'ATIVO' && anterior.status !== 'ATIVO') {
        acao = 'ATUALIZAR'
        descricao = `Documento "${anterior.nome}" reativado`
      } else if (body.observacao !== undefined && body.observacao !== anterior.observacao) {
        acao = 'ATUALIZAR'
        descricao = `Observação do documento "${anterior.nome}" atualizada`
      }
      if (acao) {
        await prisma.historico.create({
          data: {
            entidade: anterior.entidade,
            entidadeId: anterior.entidadeId,
            acao,
            descricao,
            usuarioId: (session.user as any).id ?? null,
          },
        }).catch(() => {})
      }
    }

    return NextResponse.json(anexo)
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
