export type PermissaoItem = { key: string; label: string }
export type PermissaoCategoria = { categoria: string; itens: PermissaoItem[] }

export const MODULOS_PERMISSAO: PermissaoCategoria[] = [
  {
    categoria: 'Cadastros',
    itens: [
      { key: 'CADASTROS_EMPRESAS', label: 'Empresas' },
      { key: 'CADASTROS_COLABORADORES', label: 'Colaboradores' },
    ],
  },
  {
    categoria: 'SST',
    itens: [
      { key: 'SST_PGR', label: 'PGR' },
      { key: 'SST_PCMSO', label: 'PCMSO' },
      { key: 'SST_LTCAT', label: 'LTCAT' },
      { key: 'SST_EPIS', label: 'EPIs' },
      { key: 'SST_TREINAMENTOS', label: 'Treinamentos' },
      { key: 'SST_AVCB', label: 'AVCB' },
    ],
  },
  {
    categoria: 'Meio Ambiente',
    itens: [
      { key: 'MA_LICENCAS', label: 'Licenças' },
      { key: 'MA_CONDICIONANTES', label: 'Condicionantes' },
      { key: 'MA_IBAMA', label: 'IBAMA' },
      { key: 'MA_RESIDUOS', label: 'Resíduos' },
      { key: 'MA_RECURSOS_HIDRICOS', label: 'Recursos Hídricos' },
      { key: 'MA_PRODUTOS_QUIMICOS', label: 'Produtos Químicos' },
      { key: 'MA_MONITORAMENTOS', label: 'Monitoramentos' },
    ],
  },
  {
    categoria: 'Compliance',
    itens: [
      { key: 'COMPLIANCE_CERTIFICACOES', label: 'Certificações' },
      { key: 'COMPLIANCE_TAXAS', label: 'Taxas' },
      { key: 'COMPLIANCE_DOCUMENTOS', label: 'Documentos' },
    ],
  },
  {
    categoria: 'Gestão',
    itens: [
      { key: 'GESTAO_PENDENCIAS', label: 'Pendências' },
      { key: 'GESTAO_RELATORIOS', label: 'Relatórios' },
      { key: 'GESTAO_AUDITORIA', label: 'Auditoria' },
    ],
  },
]

export const TODAS_PERMISSOES = MODULOS_PERMISSAO.flatMap(c => c.itens.map(i => i.key))

/** Mapeia rotas do sidebar para a chave de permissão do módulo correspondente. */
export const ROTA_PARA_PERMISSAO: Record<string, string> = {
  '/empresas': 'CADASTROS_EMPRESAS',
  '/colaboradores': 'CADASTROS_COLABORADORES',
  '/sst/pgr': 'SST_PGR',
  '/sst/pcmso': 'SST_PCMSO',
  '/sst/ltcat': 'SST_LTCAT',
  '/tst/epis': 'SST_EPIS',
  '/tst/estoque-epi': 'SST_EPIS',
  '/tst/treinamentos': 'SST_TREINAMENTOS',
  '/tst/comunicacoes': 'SST_TREINAMENTOS',
  '/sst/avcb': 'SST_AVCB',
  '/meio-ambiente/licencas': 'MA_LICENCAS',
  '/meio-ambiente/condicionantes': 'MA_CONDICIONANTES',
  '/meio-ambiente/ibama': 'MA_IBAMA',
  '/meio-ambiente/pgrs': 'MA_RESIDUOS',
  '/meio-ambiente/residuos': 'MA_RESIDUOS',
  '/meio-ambiente/residuos-gestao': 'MA_RESIDUOS',
  '/meio-ambiente/coletoras': 'MA_RESIDUOS',
  '/meio-ambiente/certificados-destinacao': 'MA_RESIDUOS',
  '/meio-ambiente/coleta-seletiva': 'MA_RESIDUOS',
  '/meio-ambiente/recursos-hidricos': 'MA_RECURSOS_HIDRICOS',
  '/meio-ambiente/produtos-quimicos': 'MA_PRODUTOS_QUIMICOS',
  '/meio-ambiente/monitoramentos': 'MA_MONITORAMENTOS',
  '/certificacoes': 'COMPLIANCE_CERTIFICACOES',
  '/taxas': 'COMPLIANCE_TAXAS',
  '/documentos': 'COMPLIANCE_DOCUMENTOS',
  '/pendencias': 'GESTAO_PENDENCIAS',
  '/relatorios': 'GESTAO_RELATORIOS',
  '/auditoria': 'GESTAO_AUDITORIA',
}
