import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { Compra } from "@/types/pncp";
import { capitalizarTexto } from "@/lib/utils";
import { Prisma } from "@prisma/client";

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

    // 1. Extrair os dados únicos das relações (unitCode, cnpj, code)
    const unidadesMap = new Map<string, any>();
    const orgaosMap = new Map<string, any>();
    const amparosMap = new Map<string, any>();

    for (const tender of tenders) {
      if (!tender?.numeroControlePNCP) continue;
      if (tender.unidadeOrgao)
        unidadesMap.set(tender.unidadeOrgao.codigoUnidade, tender.unidadeOrgao);
      if (tender.orgaoEntidade)
        orgaosMap.set(tender.orgaoEntidade.cnpj, tender.orgaoEntidade);
      if (tender.amparoLegal)
        amparosMap.set(String(tender.amparoLegal.codigo), tender.amparoLegal);
    }

    // 2. Buscar IDs existentes no DB para cada entidade, já com IDs
    const unidadesExistentes = await prisma.unidadeOrgao.findMany({
      where: { unitCode: { in: Array.from(unidadesMap.keys()) } },
      select: { id: true, unitCode: true },
    });
    const orgaosExistentes = await prisma.orgaoEntidade.findMany({
      where: { cnpj: { in: Array.from(orgaosMap.keys()) } },
      select: { id: true, cnpj: true },
    });
    const amparosExistentes = await prisma.amparoLegal.findMany({
      where: { code: { in: Array.from(amparosMap.keys().map(Number)) } },
      select: { id: true, code: true },
    });

    // 3. Filtrar quais precisam ser criados
    const unidadesParaCriar = Array.from(unidadesMap.entries())
      .filter(
        ([unitCode]) => !unidadesExistentes.some((u) => u.unitCode === unitCode)
      )
      .map(([_, unidade]) => ({
        unitCode: unidade.codigoUnidade,
        unitName: capitalizarTexto(unidade.nomeUnidade),
        cityName: capitalizarTexto(unidade.municipioNome),
        stateName: unidade.ufNome,
        stateAbbr: unidade.ufSigla,
        ibgeCode: unidade.codigoIbge,
      }));

    const orgaosParaCriar = Array.from(orgaosMap.entries())
      .filter(([cnpj]) => !orgaosExistentes.some((o) => o.cnpj === cnpj))
      .map(([_, orgao]) => ({
        cnpj: orgao.cnpj,
        companyName: capitalizarTexto(orgao.razaoSocial),
        powerId: orgao.poderId,
        sphereId: orgao.esferaId,
      }));

    const amparosParaCriar = Array.from(amparosMap.entries())
      .filter(
        ([code]) => !amparosExistentes.some((a) => a.code === Number(code))
      )
      .map(([_, amparo]) => ({
        code: amparo.codigo,
        name: amparo.nome,
        description: amparo.descricao,
      }));

    // 4. Criar os registros faltantes em lote (createMany)
    if (unidadesParaCriar.length > 0) {
      await prisma.unidadeOrgao.createMany({
        data: unidadesParaCriar,
        skipDuplicates: true,
      });
    }
    if (orgaosParaCriar.length > 0) {
      await prisma.orgaoEntidade.createMany({
        data: orgaosParaCriar,
        skipDuplicates: true,
      });
    }
    if (amparosParaCriar.length > 0) {
      await prisma.amparoLegal.createMany({
        data: amparosParaCriar,
        skipDuplicates: true,
      });
    }

    // 5. Rebuscar todos para garantir que temos os IDs de todas as entidades
    const unidadesFinal = await prisma.unidadeOrgao.findMany({
      where: { unitCode: { in: Array.from(unidadesMap.keys()) } },
      select: { id: true, unitCode: true },
    });
    const orgaosFinal = await prisma.orgaoEntidade.findMany({
      where: { cnpj: { in: Array.from(orgaosMap.keys()) } },
      select: { id: true, cnpj: true },
    });
    const amparosFinal = await prisma.amparoLegal.findMany({
      where: { code: { in: Array.from(amparosMap.keys().map(Number)) } },
      select: { id: true, code: true },
    });

    // Criar mapas para fácil lookup id a partir do código único
    const unidadeIdMap = new Map(unidadesFinal.map((u) => [u.unitCode, u.id]));
    const orgaoIdMap = new Map(orgaosFinal.map((o) => [o.cnpj, o.id]));
    const amparoIdMap = new Map(amparosFinal.map((a) => [a.code, a.id]));

    // 6. Montar dados dos tenders para createMany com os IDs
    const tendersCreateData: Prisma.TenderCreateManyInput = tenders
      .filter((t) => t.numeroControlePNCP)
      .map((t) => ({
        purchaseNumber: t.numeroCompra,
        process: t.processo,
        purchaseYear: t.anoCompra,
        purchaseSequence: t.sequencialCompra,
        modalityId: t.modalidadeId,
        modalityName: t.modalidadeNome,
        instrumentTypeName: t.tipoInstrumentoConvocatorioNome,
        purchaseStatusId: t.situacaoCompraId,
        purchaseStatusName: t.situacaoCompraNome,
        purchaseObject: t.objetoCompra,
        estimatedTotalValue: t.valorTotalEstimado,
        approvedTotalValue: t.valorTotalHomologado,
        inclusionDate: new Date(t.dataInclusao),
        publicationDatePncp: new Date(t.dataPublicacaoPncp),
        updateDate: new Date(t.dataAtualizacao),
        proposalOpeningDate: new Date(t.dataAberturaProposta),
        proposalClosingDate: new Date(t.dataEncerramentoProposta),
        pncpControlNumber: t.numeroControlePNCP,
        globalUpdateDate: new Date(t.dataAtualizacaoGlobal),
        disputeModeId: t.modoDisputaId,
        disputeModeName: t.modoDisputaNome,
        srp: t.srp,
        userName: t.usuarioNome,
        sourceSystemLink: t.linkSistemaOrigem,
        electronicProcessLink: t.linkProcessoEletronico,
        unidadeOrgaoId: unidadeIdMap.get(t.unidadeOrgao?.codigoUnidade),
        orgaoEntidadeId: orgaoIdMap.get(t.orgaoEntidade?.cnpj),
        amparoLegalId: amparoIdMap.get(t.amparoLegal?.codigo),
      }));

    // 7. Inserir tenders em lote
    await prisma.tender.createMany({
      data: tendersCreateData,
      skipDuplicates: true,
    });

    pagina++;
  }

  return NextResponse.json({ success: true });
}
