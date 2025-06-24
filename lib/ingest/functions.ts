import "server-only";

import { inngest, proccessCompra } from "../utils/server";
import { prisma } from "../prisma";
import axios from "axios";
import { updateTender } from "../db/queries";
import { PNCPResponse } from "@/types/pncp";
import { format, parse, subDays } from "date-fns";

export const syncPncp = inngest.createFunction(
  { id: "sync-pncp-cron", name: "Sync PNCP com cron" },
  { cron: "0 * * * *" },
  async () => {
    const dataFinal = format(new Date(), "yyyyMMdd");
    const dataInicial = format(subDays(new Date(), 1), "yyyyMMdd");

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
        try {
          const { data: tendersResponse } = await axios.get<PNCPResponse>(
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

          if (tendersResponse.empty || !tendersResponse.data?.length) break;

          const tenders = tendersResponse.data;

          const pncpNumbers = tenders.map((t) => t.numeroControlePNCP);
          const existingTenders = await prisma.tender.findMany({
            where: { pncpControlNumber: { in: pncpNumbers } },
            select: { pncpControlNumber: true },
          });

          const existingPncpSet = new Set(
            existingTenders.map((t) => t.pncpControlNumber)
          );

          const tendersToUpdate = tenders.filter((tender) =>
            existingPncpSet.has(tender.numeroControlePNCP)
          );
          const tendersToCreate = tenders.filter(
            (tender) => !existingPncpSet.has(tender.numeroControlePNCP)
          );

          await Promise.allSettled([
            ...tendersToUpdate.map((tender) =>
              updateTender(
                { pncpControlNumber: tender.numeroControlePNCP },
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
            ),
          ]);

          await proccessCompra(tendersToCreate);

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
              update: { ultimaPaginaSincronizada: pagina },
              create: {
                codigoModalidadeContratacao,
                dataInicial: new Date(
                  parse(dataInicial, "yyyyMMdd", new Date())
                ),
                dataFinal: new Date(parse(dataFinal, "yyyyMMdd", new Date())),
                ultimaPaginaSincronizada: pagina,
                endpoint: "/v1/contratacoes/atualizacao",
              },
            });
          }

          pagina++;
        } catch (error) {
          console.error(
            `Erro na página ${pagina} da modalidade ${codigoModalidadeContratacao}:`,
            error
          );
          break; // opcional: evita loop infinito em caso de erro repetido
        }
      } while (pagina <= totalPaginas);
    }
  }
);
