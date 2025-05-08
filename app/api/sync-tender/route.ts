import { prisma } from "@/lib/prisma";
import { capitalizarTexto } from "@/lib/utils";
import { Compra } from "@/types/pncp";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const hoje = new Date();
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() + 7); // Adiciona 7 dias ao dia atual

  const dataLimiteFormatada = dataLimite
    .toISOString()
    .split("T")[0]
    .replace(/-/g, ""); // Remove os hífens

  const modalidades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // Modalidades de 1 a 13

  // Faz uma requisição para cada modalidade
  for (const modalidade of modalidades) {
    let pagina = 1;
    let totalPaginas = 1;

    while (pagina <= totalPaginas) {
      // Faz a requisição para buscar as licitações da página atual e da modalidade específica
      const { data: tendersResponse } = await axios.get<{
        totalPaginas: number;
        data: Compra[];
      }>("https://pncp.gov.br/api/consulta/v1/contratacoes/proposta", {
        params: {
          dataFinal: dataLimiteFormatada, // Data limite como ISO (apenas a parte da data)
          codigoModalidadeContratacao: modalidade, // Modalidade específica
          pagina,
          tamanhoPagina: 50,
        },
      });

      const tenders = tendersResponse.data;
      totalPaginas = tendersResponse.totalPaginas;

      for (const tender of tenders) {
        const unidade = tender.unidadeOrgao;
        const orgao = tender.orgaoEntidade;
        const amparo = tender.amparoLegal;

        const municipioNomeCapitalizado = capitalizarTexto(
          unidade.municipioNome
        );
        const nomeOrgaoCapitalizado = capitalizarTexto(orgao.razaoSocial);
        const nomeUnidadeCapitalizado = capitalizarTexto(unidade.nomeUnidade);

        await prisma.unidadeOrgao.upsert({
          where: { unitCode: unidade.codigoUnidade },
          update: {},
          create: {
            unitCode: unidade.codigoUnidade,
            unitName: nomeUnidadeCapitalizado,
            cityName: municipioNomeCapitalizado,
            stateName: unidade.ufNome,
            stateAbbr: unidade.ufSigla,
            ibgeCode: unidade.codigoIbge,
          },
        });

        await prisma.orgaoEntidade.upsert({
          where: { cnpj: orgao.cnpj },
          update: {},
          create: {
            cnpj: orgao.cnpj,
            companyName: nomeOrgaoCapitalizado,
            powerId: orgao.poderId,
            sphereId: orgao.esferaId,
          },
        });

        await prisma.amparoLegal.upsert({
          where: { code: amparo.codigo },
          update: {},
          create: {
            code: amparo.codigo,
            name: amparo.nome,
            description: amparo.descricao,
          },
        });

        await prisma.tender.upsert({
          where: { pncpControlNumber: tender.numeroControlePNCP },
          update: {},
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
            // Foreign Keys
            orgaoEntidade: { connect: { cnpj: orgao.cnpj } },
            unidadeOrgao: { connect: { unitCode: unidade.codigoUnidade } },
            amparoLegal: { connect: { code: amparo.codigo } },
          },
        });
      }

      // Incrementa a página para buscar os próximos resultados
      pagina++;
    }
  }

  return NextResponse.json({ success: true });
}
