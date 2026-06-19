import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function diasParaVencer(vencimento: Date | string | null | undefined): number | null {
  if (!vencimento) return null
  return differenceInDays(new Date(vencimento), new Date())
}

export function statusVencimento(vencimento: Date | string | null | undefined, alertaDias = 30): 'vencido' | 'critico' | 'atencao' | 'ok' {
  const dias = diasParaVencer(vencimento)
  if (dias === null) return 'ok'
  if (dias < 0) return 'vencido'
  if (dias <= 7) return 'critico'
  if (dias <= alertaDias) return 'atencao'
  return 'ok'
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}
