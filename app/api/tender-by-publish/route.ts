import { prisma } from "@/lib/prisma";
import { capitalizarTexto } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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
    let pagina = 1;
    let totalPaginas = 1;

    do {
      const time = Date.now();
      const { data: tendersResponse } = await axios.get(
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

      const tenders = Array.isArray(tendersResponse.data)
        ? tendersResponse.data
        : [tendersResponse.data];

      totalPaginas = tendersResponse.totalPaginas;

      for (const tender of tenders) {
        if (!tender?.numeroControlePNCP) continue;

        const unidade = tender.unidadeOrgao;
        const orgao = tender.orgaoEntidade;
        const amparo = tender.amparoLegal;
        try {
          if (unidade) {
            await prisma.unidadeOrgao.upsert({
              where: { unitCode: unidade.codigoUnidade },
              update: {
                unitCode: unidade.codigoUnidade,
                unitName: capitalizarTexto(unidade.nomeUnidade),
                cityName: capitalizarTexto(unidade.municipioNome),
                stateName: unidade.ufNome,
                stateAbbr: unidade.ufSigla,
                ibgeCode: unidade.codigoIbge,
              },
              create: {
                unitCode: unidade.codigoUnidade,
                unitName: capitalizarTexto(unidade.nomeUnidade),
                cityName: capitalizarTexto(unidade.municipioNome),
                stateName: unidade.ufNome,
                stateAbbr: unidade.ufSigla,
                ibgeCode: unidade.codigoIbge,
              },
            });
          }

          if (orgao) {
            await prisma.orgaoEntidade.upsert({
              where: { cnpj: orgao.cnpj },
              update: {
                cnpj: orgao.cnpj,
                companyName: capitalizarTexto(orgao.razaoSocial),
                powerId: orgao.poderId,
                sphereId: orgao.esferaId,
              },
              create: {
                cnpj: orgao.cnpj,
                companyName: capitalizarTexto(orgao.razaoSocial),
                powerId: orgao.poderId,
                sphereId: orgao.esferaId,
              },
            });
          }

          if (amparo) {
            await prisma.amparoLegal.upsert({
              where: { code: amparo.codigo },
              update: {
                code: amparo.codigo,
                name: amparo.nome,
                description: amparo.descricao,
              },
              create: {
                code: amparo.codigo,
                name: amparo.nome,
                description: amparo.descricao,
              },
            });
          }

          await prisma.tender.upsert({
            where: { pncpControlNumber: tender.numeroControlePNCP },
            update: {
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
              proposalOpeningDate: new Date(tender.dataAberturaProposta),
              proposalClosingDate: new Date(tender.dataEncerramentoProposta),
              pncpControlNumber: tender.numeroControlePNCP,
              globalUpdateDate: new Date(tender.dataAtualizacaoGlobal),
              disputeModeId: tender.modoDisputaId,
              disputeModeName: tender.modoDisputaNome,
              srp: tender.srp,
              userName: tender.usuarioNome,
              sourceSystemLink: tender.linkSistemaOrigem,
              electronicProcessLink: tender.linkProcessoEletronico,
            },
            create: {
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
              proposalOpeningDate: new Date(tender.dataAberturaProposta),
              proposalClosingDate: new Date(tender.dataEncerramentoProposta),
              pncpControlNumber: tender.numeroControlePNCP,
              globalUpdateDate: new Date(tender.dataAtualizacaoGlobal),
              disputeModeId: tender.modoDisputaId,
              disputeModeName: tender.modoDisputaNome,
              srp: tender.srp,
              userName: tender.usuarioNome,
              sourceSystemLink: tender.linkSistemaOrigem,
              electronicProcessLink: tender.linkProcessoEletronico,
              ...(orgao && {
                orgaoEntidade: { connect: { cnpj: orgao.cnpj } },
              }),
              ...(unidade && {
                unidadeOrgao: { connect: { unitCode: unidade.codigoUnidade } },
              }),
              ...(amparo && {
                amparoLegal: { connect: { code: amparo.codigo } },
              }),
            },
          });
        } catch (error) {
          console.error("Erro ao criar tender:", error);
        }
      }

      const timeelapsed = Date.now() - time;
      console.log(
        `Importados tenders da modalidade ${codigoModalidadeContratacao} (página ${pagina} de ${totalPaginas}) em ${timeelapsed}ms.`,
        `Tempo estimado: ${((timeelapsed / 1000) * totalPaginas).toFixed(2)}s`
      );

      pagina += 1;
    } while (pagina <= totalPaginas);
  }

  return NextResponse.json({
    message: "Contratações importadas com relações!",
  });
}
