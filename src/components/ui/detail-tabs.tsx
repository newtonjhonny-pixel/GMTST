'use client'

export type DetailTab = { key: string; label: string; icon?: React.ElementType }

export function DetailTabs({ tabs, active, onChange }: { tabs: DetailTab[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex items-center gap-1 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex items-center gap-2"
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--brand-from)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--brand-from)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color .15s',
            }}
          >
            {tab.icon && <tab.icon size={14} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
