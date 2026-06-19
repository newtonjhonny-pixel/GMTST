export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#f1f5f9' }}>
        <p style={{ fontSize: 64, fontWeight: 800, color: '#38bdf8', margin: 0 }}>404</p>
        <p style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>Página não encontrada</p>
        <Link href="/dashboard" style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', background: '#38bdf8', color: '#0f172a', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>
          Ir para o início
        </Link>
      </div>
    </div>
  )
}
