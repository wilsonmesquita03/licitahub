interface OrgaoEntidade {
  cnpj: string;
  razaoSocial: string;
  poderId: string;
  esferaId: string;
}

interface UnidadeOrgao {
  ufNome: string;
  codigoUnidade: string;
  nomeUnidade: string;
  ufSigla: string;
  municipioNome: string;
  codigoIbge: string;
}

interface AmparoLegal {
  descricao: string;
  nome: string;
  codigo: number;
}

export interface Compra {
  srp: boolean;
  orgaoEntidade: OrgaoEntidade;
  anoCompra: number;
  sequencialCompra: number;
  dataInclusao: string; // ISO date string
  dataPublicacaoPncp: string; // ISO date string
  dataAtualizacao: string; // ISO date string
  numeroCompra: string;
  unidadeOrgao: UnidadeOrgao;
  amparoLegal: AmparoLegal;
  dataAberturaProposta: string;
  dataEncerramentoProposta: string;
  informacaoComplementar: string | null;
  processo: string;
  objetoCompra: string;
  linkSistemaOrigem: string | null;
  justificativaPresencial: string | null;
  unidadeSubRogada: string | null;
  orgaoSubRogado: string | null;
  valorTotalHomologado: number | null;
  linkProcessoEletronico: string | null;
  modoDisputaId: number;
  numeroControlePNCP: string;
  modalidadeId: number;
  dataAtualizacaoGlobal: string; // ISO date string
  valorTotalEstimado: number;
  modalidadeNome: string;
  modoDisputaNome: string;
  tipoInstrumentoConvocatorioCodigo: number;
  tipoInstrumentoConvocatorioNome: string;
  fontesOrcamentarias: any[]; // Array vazia, tipo genérico
  situacaoCompraId: number;
  situacaoCompraNome: string;
  usuarioNome: string;
}

export interface PNCPResponse {
  data: Compra[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}

export interface Compra {
  srp: boolean;
  orgaoEntidade: OrgaoEntidade;
  anoCompra: number;
  sequencialCompra: number;
  dataInclusao: string; // ISO date string
  dataPublicacaoPncp: string; // ISO date string
  dataAtualizacao: string; // ISO date string
  numeroCompra: string;
  unidadeOrgao: UnidadeOrgao;
  amparoLegal: AmparoLegal;
  dataAberturaProposta: string;
  dataEncerramentoProposta: string;
  informacaoComplementar: string | null;
  processo: string;
  objetoCompra: string;
  linkSistemaOrigem: string | null;
  justificativaPresencial: string | null;
  unidadeSubRogada: string | null;
  orgaoSubRogado: string | null;
  valorTotalHomologado: number | null;
  linkProcessoEletronico: string | null;
  modoDisputaId: number;
  numeroControlePNCP: string;
  modalidadeId: number;
  dataAtualizacaoGlobal: string; // ISO date string
  valorTotalEstimado: number;
  modalidadeNome: string;
  modoDisputaNome: string;
  tipoInstrumentoConvocatorioCodigo: number;
  tipoInstrumentoConvocatorioNome: string;
  fontesOrcamentarias: any[]; // Array vazia, tipo genérico
  situacaoCompraId: number;
  situacaoCompraNome: string;
  usuarioNome: string;
}
