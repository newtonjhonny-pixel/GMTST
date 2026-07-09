import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { salvarArquivo, MAX_UPLOAD_SIZE_BYTES, ALLOWED_MIME_TYPES } from '@/lib/storage'

// Módulos que já têm suporte a anexos habilitado no backend.
// Mantém a mesma lista da Fase 3 do pedido — evita path traversal e entidades inválidas.
export const ENTIDADES_VALIDAS = [
  'PGR', 'PCMSO', 'LTCAT', 'AET', 'LIP', 'PPP', 'ASO', 'ORDEM_SERVICO',
  'LICENCA_AMBIENTAL', 'CONDICIONANTE', 'REGISTRO_IBAMA', 'CONTROLE_RESIDUO',
  'PRODUTO_QUIMICO', 'CERTIFICACAO', 'TAXA', 'DOCUMENTO_LEGAL',
  'AVCB', 'BRIGADA', 'SIMULADO', 'EMPRESA_COLETORA', 'CERTIFICADO_DESTINACAO', 'COLETA_SELETIVA',
  'FICHA_ENTREGA_EPI', 'RECURSO_HIDRICO', 'MONITORAMENTO_AMBIENTAL', 'EPI',
]

const ID_REGEX = /^[a-zA-Z0-9_-]+$/

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const entidade = searchParams.get('entidade')
  const entidadeId = searchParams.get('entidadeId')
  const incluirInativos = searchParams.get('incluirInativos') === '1'

  if (!entidade || !entidadeId) {
    return NextResponse.json({ error: 'Parâmetros entidade e entidadeId são obrigatórios.' }, { status: 400 })
  }

  const anexos = await prisma.documentoAnexo.findMany({
    where: {
      entidade,
      entidadeId,
      ...(incluirInativos ? {} : { status: 'ATIVO' }),
    },
    include: { usuario: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(anexos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const form = await req.formData()
    const entidade = String(form.get('entidade') ?? '')
    const entidadeId = String(form.get('entidadeId') ?? '')
    const nome = String(form.get('nome') ?? '')
    const tipo = String(form.get('tipo') ?? '')
    const observacao = form.get('observacao') ? String(form.get('observacao')) : null
    const substituiId = form.get('substituiId') ? String(form.get('substituiId')) : null
    const file = form.get('arquivo')

    if (!ENTIDADES_VALIDAS.includes(entidade)) {
      return NextResponse.json({ error: 'Módulo (entidade) inválido.' }, { status: 400 })
    }
    if (!ID_REGEX.test(entidadeId)) {
      return NextResponse.json({ error: 'Identificador do registro inválido.' }, { status: 400 })
    }
    if (!nome || !tipo) {
      return NextResponse.json({ error: 'Nome e tipo do documento são obrigatórios.' }, { status: 400 })
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato de arquivo não permitido. Aceitos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP.' }, { status: 400 })
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: `Arquivo excede o tamanho máximo de ${MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB.` }, { status: 400 })
    }

    const { arquivoUrl, tamanho } = await salvarArquivo(entidade, entidadeId, file)

    const anexo = await prisma.$transaction(async (tx) => {
      const novo = await tx.documentoAnexo.create({
        data: {
          entidade,
          entidadeId,
          nome,
          tipo,
          arquivoNome: file.name,
          arquivoUrl,
          tamanho,
          mimeType: file.type,
          usuarioId: (session.user as any).id ?? null,
          observacao,
          substituiId,
          versao: substituiId ? await proximaVersao(tx, substituiId) : 1,
        },
      })

      if (substituiId) {
        await tx.documentoAnexo.update({ where: { id: substituiId }, data: { status: 'INATIVO' } })
      }

      return novo
    })

    await prisma.historico.create({
      data: {
        entidade,
        entidadeId,
        acao: substituiId ? 'SUBSTITUIR' : 'CRIAR',
        descricao: substituiId
          ? `Documento "${nome}" (${tipo}) substituído`
          : `Documento "${nome}" (${tipo}) anexado`,
        usuarioId: (session.user as any).id ?? null,
      },
    }).catch(() => {})

    return NextResponse.json(anexo, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao enviar documento' }, { status: 400 })
  }
}

async function proximaVersao(tx: any, substituiId: string) {
  const anterior = await tx.documentoAnexo.findUnique({ where: { id: substituiId }, select: { versao: true } })
  return (anterior?.versao ?? 1) + 1
}
