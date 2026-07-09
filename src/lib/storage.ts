import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises'

export const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024 // 15MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
]

function baseUploadsDir() {
  return process.env.UPLOADS_DIR ?? path.join(/* turbopackIgnore: true */ process.cwd(), 'storage', 'uploads')
}

/**
 * Salva um arquivo enviado para storage/uploads/<entidade>/<entidadeId>/<uuid>.<ext>.
 * Retorna o caminho relativo (armazenado no banco) — nunca o caminho absoluto do disco.
 */
export async function salvarArquivo(entidade: string, entidadeId: string, file: File): Promise<{ arquivoUrl: string; tamanho: number }> {
  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name) || '.pdf'
  const nomeArquivo = `${randomUUID()}${ext}`
  const relDir = path.join(entidade, entidadeId)
  const absDir = path.join(baseUploadsDir(), relDir)

  await mkdir(absDir, { recursive: true })
  await writeFile(path.join(absDir, nomeArquivo), bytes)

  return { arquivoUrl: path.join(relDir, nomeArquivo).split(path.sep).join('/'), tamanho: bytes.length }
}

export async function lerArquivo(arquivoUrl: string): Promise<Buffer> {
  const absPath = path.join(baseUploadsDir(), arquivoUrl)
  return readFile(absPath)
}

export async function removerArquivoFisico(arquivoUrl: string): Promise<void> {
  const absPath = path.join(baseUploadsDir(), arquivoUrl)
  await unlink(absPath)
}
