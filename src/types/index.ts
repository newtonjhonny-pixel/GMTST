export type { UserRole, StatusGeral, StatusDocumento, StatusTaxa, StatusPendencia, Prioridade, OrigemPendencia, TipoASO, ResultadoASO, TipoLicenca, TipoDocumentoLegal, TipoAcidente, StatusColaborador } from '@prisma/client'

export interface DashboardStats {
  pendenciasAbertas: number
  pendenciasVencidas: number
  documentosVencidos: number
  documentosAVencer: number
  taxasPendentes: number
  certificacoesVencidas: number
  asosVencidos: number
  treinamentosVencidos: number
  episPendentes: number
  licencasVencidas: number
}
