import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { Compra } from "@/types/pncp";
import { capitalizarTexto } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  params: Promise<{ modalidade: string }>
) {
  const hoje = new Date();
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() + 7);

  const dataLimiteFormatada = dataLimite
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");
  const modalidades = (await params).modalidade;

  for (const modalidade of modalidades) {
    let pagina = 1;
    let totalPaginas = 1;

    while (pagina <= totalPaginas) {
      const { data: tendersResponse } = await axios.get<{
        totalPaginas: number;
        data: Compra[];
      }>("https://pncp.gov.br/api/consulta/v1/contratacoes/proposta", {
        params: {
          dataFinal: dataLimiteFormatada,
          codigoModalidadeContratacao: modalidade,
          pagina,
          tamanhoPagina: 50,
        },
      });

      const tenders = Array(tendersResponse.data) as unknown as Compra[];
      totalPaginas = tendersResponse.totalPaginas;

      for (const tender of tenders) {
        if (!tender?.numeroControlePNCP) {
          continue;
        }

        const unidade = tender.unidadeOrgao;
        const orgao = tender.orgaoEntidade;
        const amparo = tender.amparoLegal;

        // Verificações de existência
        if (unidade) {
          await prisma.unidadeOrgao.upsert({
            where: { unitCode: unidade.codigoUnidade },
            update: {},
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
            update: {},
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
            update: {},
            create: {
              code: amparo.codigo,
              name: amparo.nome,
              description: amparo.descricao,
            },
          });
        }

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
            ...(orgao && { orgaoEntidade: { connect: { cnpj: orgao.cnpj } } }),
            ...(unidade && {
              unidadeOrgao: { connect: { unitCode: unidade.codigoUnidade } },
            }),
            ...(amparo && {
              amparoLegal: { connect: { code: amparo.codigo } },
            }),
          },
        });
      }

      pagina++;
    }
  }

  return NextResponse.json({ success: true });
}
