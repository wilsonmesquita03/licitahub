import { updateTender } from "@/lib/db/queries";
import { prisma } from "@/lib/prisma";
import { capitalizarTexto } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { parse } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

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

interface Compra {
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

interface ResponseData {
  data: Compra[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}

export async function GET(request: NextRequest) {
  const dataInicial = request.nextUrl.searchParams.get("dataInicial");
  const dataFinal = request.nextUrl.searchParams.get("dataFinal");

  if (!dataInicial || !dataFinal) {
    return NextResponse.json(
      { error: "Parâmetros dataInicial e dataFinal são obrigatórios." },
      { status: 400 }
    );
  }

  for (
    let codigoModalidadeContratacao = 1;
    codigoModalidadeContratacao <= 13;
    codigoModalidadeContratacao++
  ) {
    const existingProgress = await prisma.pncpSyncProgress.findUnique({
      where: {
        codigoModalidadeContratacao_dataInicial_dataFinal_endpoint: {
          codigoModalidadeContratacao,
          dataInicial: new Date(parse(dataInicial, "yyyyMMdd", new Date())),
          dataFinal: new Date(parse(dataFinal, "yyyyMMdd", new Date())),
          endpoint: "/v1/contratacoes/atualizacao",
        },
      },
    });

    let pagina = existingProgress
      ? existingProgress.ultimaPaginaSincronizada + 1
      : 1;
    let totalPaginas = 1;

    do {
      console.log(
        `>> Iniciando fetch - Modalidade ${codigoModalidadeContratacao}, Página ${pagina}`
      );
      console.time("Tempo total página");

      try {
        console.time("Fetch API externa");
        const { data: tendersResponse } = await axios.get<ResponseData>(
          "https://pncp.gov.br/api/consulta/v1/contratacoes/atualizacao",
          {
            params: {
              dataInicial,
              dataFinal,
              codigoModalidadeContratacao,
              pagina,
              tamanhoPagina: 50,
            },
          }
        );
        console.timeEnd("Fetch API externa");

        if (tendersResponse.empty) {
          console.log("✔️ Nenhuma compra encontrada na pagina");
          break;
        }

        const tenders = Array.isArray(tendersResponse.data)
          ? tendersResponse.data
          : [tendersResponse.data];

        if (!tenders[0]) {
          console.log("✔️ Nenhuma compra encontrada na pagina");
          break;
        }

        const pncpNumbers = tenders.map((t) => t.numeroControlePNCP);

        const existingTenders = await prisma.tender.findMany({
          where: {
            pncpControlNumber: {
              in: pncpNumbers,
            },
          },
          select: {
            pncpControlNumber: true,
          },
        });

        const existingPncpSet = new Set(
          existingTenders.map((t) => t.pncpControlNumber)
        );

        if (existingPncpSet.size === 0) {
          console.log("✔️ Nenhuma compra encontrada na pagina");
          break;
        }

        await Promise.allSettled(
          tenders
            .filter((tender) => existingPncpSet.has(tender.numeroControlePNCP))
            .map((tender) =>
              updateTender(
                {
                  pncpControlNumber: tender.numeroControlePNCP,
                },
                {
                  purchaseNumber: tender.numeroCompra,
                  process: tender.processo,
                  purchaseYear: tender.anoCompra,
                  purchaseSequence: tender.sequencialCompra,
                  modalityId: tender.modalidadeId,
                  modalityName: tender.modalidadeNome,
                  instrumentTypeName: tender.tipoInstrumentoConvocatorioNome,
                  purchaseStatusId: tender.situacaoCompraId,
                  purchaseStatusName: tender.situacaoCompraNome,
                  purchaseObject: tender.objetoCompra,
                  estimatedTotalValue: tender.valorTotalEstimado,
                  approvedTotalValue: tender.valorTotalHomologado,
                  inclusionDate: new Date(tender.dataInclusao),
                  publicationDatePncp: new Date(tender.dataPublicacaoPncp),
                  updateDate: new Date(tender.dataAtualizacao),
                  proposalOpeningDate: tender.dataAberturaProposta
                    ? new Date(tender.dataAberturaProposta)
                    : null,
                  proposalClosingDate: tender.dataEncerramentoProposta
                    ? new Date(tender.dataEncerramentoProposta)
                    : null,
                  pncpControlNumber: tender.numeroControlePNCP,
                  globalUpdateDate: new Date(tender.dataAtualizacaoGlobal),
                  disputeModeId: tender.modoDisputaId,
                  disputeModeName: tender.modoDisputaNome,
                  srp: tender.srp,
                  userName: tender.usuarioNome,
                  sourceSystemLink: tender.linkSistemaOrigem,
                  electronicProcessLink: tender.linkProcessoEletronico,
                }
              )
            )
        );

        totalPaginas = tendersResponse.totalPaginas;

        if (tenders.length === 50) {
          await prisma.pncpSyncProgress.upsert({
            where: {
              codigoModalidadeContratacao_dataInicial_dataFinal_endpoint: {
                codigoModalidadeContratacao,
                dataInicial: new Date(
                  parse(dataInicial, "yyyyMMdd", new Date())
                ),
                dataFinal: new Date(parse(dataFinal, "yyyyMMdd", new Date())),
                endpoint: "/v1/contratacoes/atualizacao",
              },
            },
            update: {
              ultimaPaginaSincronizada: pagina,
            },
            create: {
              codigoModalidadeContratacao,
              dataInicial: new Date(parse(dataInicial, "yyyyMMdd", new Date())),
              dataFinal: new Date(parse(dataFinal, "yyyyMMdd", new Date())),
              ultimaPaginaSincronizada: pagina,
              endpoint: "/v1/contratacoes/atualizacao",
            },
          });
        }

        pagina++;
        console.timeEnd("Tempo total página");
      } catch (error) {
        console.error(
          `❌ Erro na página ${pagina} da modalidade ${codigoModalidadeContratacao}:`,
          error
        );
      }
    } while (pagina <= totalPaginas);
  }

  return NextResponse.json({ status: "Concluído com sucesso" });
}
