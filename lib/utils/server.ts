import "server-only";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Inngest } from "inngest";

export async function checkIfRelatedToFile(
  conversationHistory: string,
  newMessage: string
): Promise<boolean> {
  const prompt = `
    Você é um assistente que avalia se uma nova pergunta do usuário está relacionada a documentos enviados anteriormente na conversa, como editais de licitação, PDFs, ou anexos com conteúdo técnico. 

    Responda apenas com **"true"** ou **"false"**, sem explicações.

    - Responda "true" se a nova pergunta depende de, menciona ou está relacionada a informações específicas contidas nesses documentos.
    - Caso a nova pergunta seja genérica, irrelevante ou não se relacione com nenhum conteúdo previamente enviado, responda "false".
    - Caso a nova informação tenha sido enviada com o objetivo de aprofundar em um determinado assunto, responda "true".
    - Caso o usuário peça explicitamente para verificar no arquivo responda "true".
    - Se o usuário disser que não encontrou uma informação no arquivo, responda "true".

    Exemplos:
    - Se o usuário enviou um edital e depois pergunta "Qual o valor do contrato?", a resposta deve ser **"true"**.
    - Se o usuário enviou um arquivo e depois pergunta "Como você está?", a resposta deve ser **"false"**.

    Conversa (últimas 10 mensagens):
    ${conversationHistory}

    Nova pergunta do usuário: "${newMessage}"
  `.trim();

  try {
    const { response } = await generateText({
      model: openai("gpt-4o-mini"),
      system: prompt,
      prompt: "Você responde apenas true ou false.",
    });

    // @ts-expect-error
    const answer = response.body.choices?.[0]?.message?.content
      ?.toLowerCase()
      .trim();

    return answer === "true";
  } catch (error) {
    return false;
  }
}

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Compra } from "@/types/pncp";
import { prisma } from "../prisma";
import { capitalizarTexto } from "../utils";

export async function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();

          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function isValidRedirect(path: string | null): boolean {
  if (!path) return false;
  // Permite apenas caminhos relativos
  return (
    typeof path === "string" && path.startsWith("/") && !path.includes("//")
  );
}

export async function proccessCompra(compras: Compra[]) {
  const unidades = new Map<string, any>();
  const orgaos = new Map<string, any>();
  const amparos = new Map<number, any>();

  for (const tender of compras) {
    if (!tender?.numeroControlePNCP) continue;
    if (tender.unidadeOrgao) {
      unidades.set(tender.unidadeOrgao.codigoUnidade, tender.unidadeOrgao);
    }
    if (tender.orgaoEntidade) {
      orgaos.set(tender.orgaoEntidade.cnpj, tender.orgaoEntidade);
    }
    if (tender.amparoLegal) {
      amparos.set(tender.amparoLegal.codigo, tender.amparoLegal);
    }
  }

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

  const unidadesParaCriar = Array.from(unidades.entries())
    .filter(([code]) => !unidadesExistentes.some((u) => u.unitCode === code))
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

  if (unidadesParaCriar.length > 0) {
    await prisma.unidadeOrgao.createMany({
      data: unidadesParaCriar,
      skipDuplicates: true,
    });

    unidadesExistentes = await prisma.unidadeOrgao.findMany({
      where: { unitCode: { in: Array.from(unidades.keys()) } },
      select: { unitCode: true, id: true },
    });
  }

  if (orgaosParaCriar.length > 0) {
    await prisma.orgaoEntidade.createMany({
      data: orgaosParaCriar,
      skipDuplicates: true,
    });

    orgaosExistentes = await prisma.orgaoEntidade.findMany({
      where: { cnpj: { in: Array.from(orgaos.keys()) } },
      select: { cnpj: true, id: true },
    });
  }

  if (amparosParaCriar.length > 0) {
    await prisma.amparoLegal.createMany({
      data: amparosParaCriar,
      skipDuplicates: true,
    });

    amparosExistentes = await prisma.amparoLegal.findMany({
      where: { code: { in: Array.from(amparos.keys()) } },
      select: { code: true, id: true },
    });
  }

  const INT_MIN = -2147483648;
  const INT_MAX = 2147483647;

  const tendersCreateData = compras
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

  return await prisma.tender.createMany({
    data: tendersCreateData,
    skipDuplicates: true,
  });
}

export const inngest = new Inngest({ id: "licitahub" });

export const mapCompraToTender = (t: Compra) => ({
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
  proposalOpeningDate: t.dataAberturaProposta
    ? new Date(t.dataAberturaProposta)
    : null,
  proposalClosingDate: t.dataEncerramentoProposta
    ? new Date(t.dataEncerramentoProposta)
    : null,
  pncpControlNumber: t.numeroControlePNCP,
  globalUpdateDate: new Date(t.dataAtualizacaoGlobal),
  disputeModeId: t.modoDisputaId,
  disputeModeName: t.modoDisputaNome,
  srp: t.srp,
  userName: t.usuarioNome,
  sourceSystemLink: t.linkSistemaOrigem,
  electronicProcessLink: t.linkProcessoEletronico,
});
