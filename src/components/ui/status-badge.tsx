import { Badge } from './badge'
import { statusVencimento } from '@/lib/utils'

interface VencimentoBadgeProps {
  vencimento: Date | string | null | undefined
  alertaDias?: number
}

export function VencimentoBadge({ vencimento, alertaDias = 30 }: VencimentoBadgeProps) {
  const status = statusVencimento(vencimento, alertaDias)
  const map = {
    vencido: { variant: 'danger' as const, label: 'Vencido' },
    critico: { variant: 'danger' as const, label: 'Crítico' },
    atencao: { variant: 'warning' as const, label: 'A vencer' },
    ok: { variant: 'success' as const, label: 'Vigente' },
  }
  return <Badge variant={map[status].variant}>{map[status].label}</Badge>
}

export function StatusPendenciaBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'; label: string }> = {
    ABERTA: { variant: 'warning', label: 'Aberta' },
    EM_ANDAMENTO: { variant: 'info', label: 'Em Andamento' },
    CONCLUIDA: { variant: 'success', label: 'Concluída' },
    VENCIDA: { variant: 'danger', label: 'Vencida' },
    CANCELADA: { variant: 'secondary', label: 'Cancelada' },
  }
  const s = map[status] || { variant: 'default' as const, label: status }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const map: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'; label: string }> = {
    BAIXA: { variant: 'secondary', label: 'Baixa' },
    MEDIA: { variant: 'info', label: 'Média' },
    ALTA: { variant: 'warning', label: 'Alta' },
    CRITICA: { variant: 'danger', label: 'Crítica' },
  }
  const p = map[prioridade] || { variant: 'default' as const, label: prioridade }
  return <Badge variant={p.variant}>{p.label}</Badge>
}
