import { NextResponse } from 'next/server'

// Modulo desabilitado. Nenhum dado interno e enviado a servicos externos.
export async function POST() {
  return NextResponse.json(
    { error: 'Módulo Agente IA desabilitado.' },
    { status: 410 }
  )
}
