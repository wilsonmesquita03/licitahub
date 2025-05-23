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
        codigoModalidadeContratacao_dataInicial_dataFinal: {
          codigoModalidadeContratacao,
          dataInicial: new Date(parse(dataInicial, "yyyyMMdd", new Date())),
          dataFinal: new Date(parse(dataFinal, "yyyyMMdd", new Date())),
        },
        endpoint: "/v1/contratacoes/publicacao",
      },
    });

    let pagina = existingProgress
      ? existingProgress.ultimaPaginaSincronizada + 1
      : 1;
    let totalPaginas = 1;

    if (pagina > totalPaginas) {
      continue;
    }

    do {
      console.log(
        `>> Iniciando fetch - Modalidade ${codigoModalidadeContratacao}, Página ${pagina}`
      );
      console.time("Tempo total página");

      try {
        console.time("Fetch API externa");
        const { data: tendersResponse } = await axios.get<ResponseData>(
          "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao",
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

        totalPaginas = tendersResponse.totalPaginas;
        console.log(`✔️ Total de tenders recebidos: ${tenders.length}`);
        console.log(`✔️ Total de páginas: ${totalPaginas}`);

        const unidades = new Map<string, any>();
        const orgaos = new Map<string, any>();
        const amparos = new Map<number, any>();

        for (const tender of tenders) {
          if (!tender?.numeroControlePNCP) continue;
          if (tender.unidadeOrgao) {
            unidades.set(
              tender.unidadeOrgao.codigoUnidade,
              tender.unidadeOrgao
            );
          }
          if (tender.orgaoEntidade) {
            orgaos.set(tender.orgaoEntidade.cnpj, tender.orgaoEntidade);
          }
          if (tender.amparoLegal) {
            amparos.set(tender.amparoLegal.codigo, tender.amparoLegal);
          }
        }

        console.log(`🔍 Unidades únicas: ${unidades.size}`);
        console.log(`🔍 Órgãos únicos: ${orgaos.size}`);
        console.log(`🔍 Amparos únicos: ${amparos.size}`);

        console.time("Busca existentes no DB");
        let [unidadesExistentes, orgaosExistentes, amparosExistentes] =
          await Promise.all([
            prisma.unidadeOrgao.findMany({
              where: { unitCode: { in: Array.from(unidades.keys()) } },
              select: { unitCode: true, id: true },
            }),
            prisma.orgaoEntidade.findMany({
              where: { cnpj: { in: Array.from(orgaos.keys()) } },
              select: { cnpj: true, id: true },
            }),
            prisma.amparoLegal.findMany({
              where: { code: { in: Array.from(amparos.keys()) } },
              select: { code: true, id: true },
            }),
          ]);
        console.timeEnd("Busca existentes no DB");

        const unidadesParaCriar = Array.from(unidades.entries())
          .filter(
            ([code]) => !unidadesExistentes.some((u) => u.unitCode === code)
          )
          .map(([code, unidade]) => ({
            unitCode: unidade.codigoUnidade,
            unitName: capitalizarTexto(unidade.nomeUnidade),
            cityName: capitalizarTexto(unidade.municipioNome),
            stateName: unidade.ufNome,
            stateAbbr: unidade.ufSigla,
            ibgeCode: unidade.codigoIbge,
          }));

        const orgaosParaCriar = Array.from(orgaos.entries())
          .filter(([cnpj]) => !orgaosExistentes.some((o) => o.cnpj === cnpj))
          .map(([cnpj, orgao]) => ({
            cnpj: orgao.cnpj,
            companyName: capitalizarTexto(orgao.razaoSocial),
            powerId: orgao.poderId,
            sphereId: orgao.esferaId,
          }));

        const amparosParaCriar = Array.from(amparos.entries())
          .filter(([code]) => !amparosExistentes.some((a) => a.code === code))
          .map(([code, amparo]) => ({
            code: amparo.codigo,
            name: amparo.nome,
            description: amparo.descricao,
          }));

        console.log(`📌 Unidades para criar: ${unidadesParaCriar.length}`);
        console.log(`📌 Órgãos para criar: ${orgaosParaCriar.length}`);
        console.log(`📌 Amparos para criar: ${amparosParaCriar.length}`);

        if (unidadesParaCriar.length > 0) {
          console.time("CreateMany Unidades");
          await prisma.unidadeOrgao.createMany({
            data: unidadesParaCriar,
            skipDuplicates: true,
          });
          console.timeEnd("CreateMany Unidades");

          unidadesExistentes = await prisma.unidadeOrgao.findMany({
            where: { unitCode: { in: Array.from(unidades.keys()) } },
            select: { unitCode: true, id: true },
          });
        }

        if (orgaosParaCriar.length > 0) {
          console.time("CreateMany Órgãos");
          await prisma.orgaoEntidade.createMany({
            data: orgaosParaCriar,
            skipDuplicates: true,
          });
          console.timeEnd("CreateMany Órgãos");

          orgaosExistentes = await prisma.orgaoEntidade.findMany({
            where: { cnpj: { in: Array.from(orgaos.keys()) } },
            select: { cnpj: true, id: true },
          });
        }

        if (amparosParaCriar.length > 0) {
          console.time("CreateMany Amparos");
          await prisma.amparoLegal.createMany({
            data: amparosParaCriar,
            skipDuplicates: true,
          });
          console.timeEnd("CreateMany Amparos");

          amparosExistentes = await prisma.amparoLegal.findMany({
            where: { code: { in: Array.from(amparos.keys()) } },
            select: { code: true, id: true },
          });
        }

        console.time("CreateMany Tenders");
        const INT_MIN = -2147483648;
        const INT_MAX = 2147483647;

        const tendersCreateData = tenders
          .filter((tender) => {
            const valorTotalEstimado = tender?.valorTotalEstimado || 0;
            const valorTotalHomologado = tender?.valorTotalHomologado || 0;

            return (
              Number.isFinite(valorTotalEstimado) &&
              Number.isFinite(valorTotalHomologado) &&
              valorTotalEstimado >= INT_MIN &&
              valorTotalEstimado <= INT_MAX &&
              (valorTotalHomologado || 0) >= INT_MIN &&
              (valorTotalHomologado || 0) <= INT_MAX
            );
          })
          .filter((tender) => tender?.numeroControlePNCP) // só tender válido
          .map((tender) => {
            const orgaoEntidadeId = orgaosExistentes.find(
              (o) => o.cnpj === tender.orgaoEntidade.cnpj
            )?.id as string;
            const unidadeOrgaoId = unidadesExistentes.find(
              (u) => u.unitCode === tender.unidadeOrgao.codigoUnidade
            )?.id as string;
            const amparoLegalId = amparosExistentes.find(
              (a) => a.code === tender.amparoLegal.codigo
            )?.id as string;

            return {
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
              orgaoEntidadeId,
              unidadeOrgaoId,
              amparoLegalId,
            };
          });

        // --- Inserir tenders em lote ---
        // Importante: configure seu schema para aceitar esses campos FK

        await prisma.tender.createMany({
          data: tendersCreateData,
          skipDuplicates: true,
        });
        console.timeEnd("CreateMany Tenders");

        if (tenders.length === 50) {
          await prisma.pncpSyncProgress.upsert({
            where: {
              codigoModalidadeContratacao_dataInicial_dataFinal: {
                codigoModalidadeContratacao,
                dataInicial: new Date(
                  parse(dataInicial, "yyyyMMdd", new Date())
                ),
                dataFinal: new Date(parse(dataFinal, "yyyyMMdd", new Date())),
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
              endpoint: "/v1/contratacoes/publicacao",
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

        if (error instanceof AxiosError) {
          return NextResponse.json({ error: "Erro no PNCP" }, { status: 500 });
        }
      }
    } while (pagina <= totalPaginas);
  }

  return NextResponse.json({ status: "Concluído com sucesso" });
}
