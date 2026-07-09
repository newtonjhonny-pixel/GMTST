import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if ((session.user as any).role !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'Somente administradores podem excluir ou restaurar movimentações.' }, { status: 403 })
  }
  const { id } = await params

  try {
    const mov = await prisma.estoqueEPI.findUnique({ where: { id }, include: { epi: true } })
    if (!mov) return NextResponse.json({ error: 'Movimento não encontrado' }, { status: 404 })

    const body = await req.json()
    const ativo = Boolean(body.ativo)
    if (ativo === mov.ativo) return NextResponse.json(mov)

    const atualizado = await prisma.$transaction(async (tx) => {
      // Reverte (ou reaplica) o efeito do movimento no saldo do EPI ao inativar/restaurar.
      const efeito = (t: string) => (t === 'ENTRADA' || t === 'DEVOLUCAO') ? mov.quantidade : (t === 'AJUSTE' ? 0 : -mov.quantidade)
      const delta = ativo ? efeito(mov.tipo) : -efeito(mov.tipo)

      if (mov.tipo !== 'AJUSTE') {
        const epiAtual = await tx.ePI.findUnique({ where: { id: mov.epiId } })
        if (!epiAtual) throw new Error('EPI não encontrado.')
        const novoSaldo = epiAtual.quantidadeEstoque + delta
        if (novoSaldo < 0) {
          throw Object.assign(new Error('Quantidade insuficiente em estoque.'), { code: 'ESTOQUE_INSUFICIENTE' })
        }
        await tx.ePI.update({ where: { id: mov.epiId }, data: { quantidadeEstoque: novoSaldo } })
      }

      return tx.estoqueEPI.update({ where: { id }, data: { ativo } })
    })

    await prisma.historico.create({
      data: {
        entidade: 'EPI',
        entidadeId: mov.epiId,
        acao: ativo ? 'ATUALIZAR' : 'EXCLUIR',
        descricao: `Movimento de estoque (${mov.tipo}, ${mov.quantidade} un.) de "${mov.epi.nome}" ${ativo ? 'restaurado' : 'excluído logicamente'} por ${(session.user as any).name ?? 'administrador'}`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(atualizado)
  } catch (err: any) {
    if (err?.code === 'ESTOQUE_INSUFICIENTE') return NextResponse.json({ error: 'Quantidade insuficiente em estoque.' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
