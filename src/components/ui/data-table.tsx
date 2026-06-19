'use client'

interface Column {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps {
  columns: Column[]
  children: React.ReactNode
  empty?: { icon?: string; message: string }
  rowCount?: number
}

export function DataTable({ columns, children, empty, rowCount = 1 }: DataTableProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-card-alt)', borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: '10px 16px',
                  textAlign: col.align ?? 'left',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowCount === 0 && empty ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 16px' }}>
                {empty.icon && <div style={{ fontSize: 32, marginBottom: 8 }}>{empty.icon}</div>}
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{empty.message}</p>
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

interface TdProps {
  children?: React.ReactNode
  bold?: boolean
  muted?: boolean
  mono?: boolean
  align?: 'left' | 'center' | 'right'
}

export function Td({ children, bold, muted, mono, align }: TdProps) {
  return (
    <td
      style={{
        padding: '11px 16px',
        fontSize: 12,
        fontWeight: bold ? 600 : 400,
        color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: mono ? 'monospace' : undefined,
        textAlign: align ?? 'left',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </td>
  )
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, transition: 'background .1s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-alt)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </tr>
  )
}

/* Pill badge */
export function Pill({
  children, color, bg,
}: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '2px 8px', borderRadius: 20,
        fontSize: 10, fontWeight: 700,
        background: bg, color,
      }}
    >
      {children}
    </span>
  )
}
