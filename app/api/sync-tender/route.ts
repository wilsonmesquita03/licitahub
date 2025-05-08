import { prisma } from "@/lib/prisma";
import { Compra } from "@/types/pncp";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

function capitalizarTexto(texto: string) {
  const preposicoes = ["de", "da", "do", "das", "dos", "e"];
  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra, i) => {
      if (i !== 0 && preposicoes.includes(palavra)) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

export async function GET(request: NextRequest) {
  const { data: tenders } = await axios.get<{ data: Compra[] }>(
    "https://pncp.gov.br/api/consulta/v1/contratacoes/proposta",
    {
      params: {
        dataFinal: 20250508,
        codigoModalidadeContratacao: 6,
        pagina: 1,
        tamanhoPagina: 50,
      },
    }
  );

  for (const tender of tenders.data) {
    const unidade = tender.unidadeOrgao;
    const orgao = tender.orgaoEntidade;
    const amparo = tender.amparoLegal;

    const municipioNomeCapitalizado = capitalizarTexto(unidade.municipioNome);
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

  return NextResponse.json({ success: true });
}
