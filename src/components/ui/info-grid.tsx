export function InfoSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3" style={{ marginTop: 18 }}>
      <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{children}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

export function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {children}
    </div>
  )
}

export function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', minHeight: 20 }}>{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
