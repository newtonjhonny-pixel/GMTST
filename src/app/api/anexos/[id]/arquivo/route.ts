import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { lerArquivo } from '@/lib/storage'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const anexo = await prisma.documentoAnexo.findUnique({ where: { id } })
  if (!anexo) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

  let bytes: Buffer
  try {
    bytes = await lerArquivo(anexo.arquivoUrl)
  } catch {
    return NextResponse.json({ error: 'Arquivo não encontrado no armazenamento.' }, { status: 404 })
  }

  const download = new URL(req.url).searchParams.get('download') === '1'
  const disposition = download ? 'attachment' : 'inline'

  await prisma.historico.create({
    data: {
      entidade: anexo.entidade,
      entidadeId: anexo.entidadeId,
      acao: download ? 'BAIXAR' : 'VISUALIZAR',
      descricao: `Documento "${anexo.nome}" ${download ? 'baixado' : 'visualizado'}`,
      usuarioId: (session.user as any).id ?? null,
    },
  }).catch(() => {})

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': anexo.mimeType,
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(anexo.arquivoNome)}"`,
      'Content-Length': String(anexo.tamanho),
      'Cache-Control': 'private, no-store',
    },
  })
}
