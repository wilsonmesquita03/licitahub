type UnidadeOrgao = {
  ufNome: string;
  codigoUnidade: string;
  nomeUnidade: string;
  ufSigla: string;
  municipioNome: string;
  codigoIbge: string;
};

type OrgaoEntidade = {
  cnpj: string;
  razaoSocial: string;
  poderId: string;
  esferaId: string;
};

type AmparoLegal = {
  descricao: string;
  nome: string;
  codigo: number;
};

export type Compra = {
  dataInclusao: string; // ISO string
  dataPublicacaoPncp: string;
  dataAtualizacao: string;
  numeroCompra: string;
  unidadeOrgao: UnidadeOrgao;
  srp: boolean;
  orgaoEntidade: OrgaoEntidade;
  anoCompra: number;
  sequencialCompra: number;
  amparoLegal: AmparoLegal;
  dataAberturaProposta: string;
  dataEncerramentoProposta: string;
  informacaoComplementar: string;
  processo: string;
  objetoCompra: string;
  linkSistemaOrigem: string;
  justificativaPresencial: string;
  unidadeSubRogada: null;
  orgaoSubRogado: null;
  valorTotalHomologado: number | null;
  numeroControlePNCP: string;
  dataAtualizacaoGlobal: string;
  linkProcessoEletronico: string | null;
  modalidadeId: number;
  modoDisputaId: number;
  valorTotalEstimado: number;
  modalidadeNome: string;
  modoDisputaNome: string;
  tipoInstrumentoConvocatorioCodigo: number;
  tipoInstrumentoConvocatorioNome: string;
  situacaoCompraId: number;
  situacaoCompraNome: string;
  usuarioNome: string;
};
