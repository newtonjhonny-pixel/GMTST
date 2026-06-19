import { Construction } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
  fase?: string
}

export function ComingSoon({ title, description, fase = '2' }: ComingSoonProps) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-.3px' }}>
          {title}
        </h1>
        {description && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>

      <div
        className="flex flex-col items-center justify-center rounded-2xl py-24 gap-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 64, height: 64, background: 'var(--warning-bg)' }}
        >
          <Construction size={28} style={{ color: 'var(--warning-text)' }} />
        </div>
        <div className="text-center">
          <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            Em desenvolvimento
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Este módulo será implementado na Fase {fase} do projeto.
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}
        >
          Fase {fase} — Em breve
        </span>
      </div>
    </div>
  )
}
