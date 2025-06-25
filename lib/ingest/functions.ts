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

          await proccessCompra(tenders);

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
