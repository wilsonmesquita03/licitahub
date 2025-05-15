import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { Compra } from "@/types/pncp";
import { capitalizarTexto } from "@/lib/utils";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(
  request: NextRequest,
  {
    params,
    searchParams,
  }: {
    params: Promise<{ modalidade: string; page?: string }>;
    searchParams?: Promise<{ page?: string }>;
  }
) {
  const start = Date.now(); // tempo inicial
  const maxExecutionTime = 60_000;

  const now = new Date();
  const dataLimite = new Date(now);
  dataLimite.setDate(now.getDate() + 7);

  const dataLimiteFormatada = dataLimite
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");

  const modalidade = (await params).modalidade;

  let pagina = Number(request.nextUrl.searchParams.get("page")) || 1;
  let totalPaginas = 1;

  openai.embeddings.create({
    model: "text-embedding-3-small",
    input: "Hello world",
    encoding_format: "float"
  })

  while (pagina <= totalPaginas) {
    const elapsed = Date.now() - start;
    const remaining = maxExecutionTime - elapsed;

    if (remaining < 20_000) {
      return NextResponse.json({
        success: false,
        message: "Tempo quase esgotado, processo interrompido com segurança.",
        currentPage: pagina,
        modalidade,
      });
    }

    const { data: tendersResponse } = await axios.get<{
      empty: boolean;
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

    if (tendersResponse.empty) {
      return NextResponse.json({
        success: true,
        message: "Nenhuma proposta encontrada.",
        currentPage: pagina,
        modalidade,
      });
    }

    const tenders = Array.isArray(tendersResponse.data)
      ? tendersResponse.data
      : [tendersResponse.data];
    totalPaginas = tendersResponse.totalPaginas;

    for (const tender of tenders) {
      if (!tender?.numeroControlePNCP) continue;

      const unidade = tender.unidadeOrgao;
      const orgao = tender.orgaoEntidade;
      const amparo = tender.amparoLegal;

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

  return NextResponse.json({ success: true });
}
