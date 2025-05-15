"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CostItem } from "@prisma/client";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { OpenAI } from "openai";
import pdfMake from "pdfMake";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzePdf(file: File) {
  if (!file) throw new Error("Arquivo não encontrado");
  const session = await getSession();

  if (!session.user) throw new Error("Usuário não autenticado");

  const assistant = await prisma.assistant.findFirst({
    where: {
      userId: session.user.id,
      name: "default",
    },
  });

  if (!assistant) redirect("/onboarding");

  const uploaded = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content:
      "Analise detalhadamente o PDF de licitação e siga suas instruções de resposta a risca",
    attachments: [
      {
        file_id: uploaded.id,
        tools: [{ type: "file_search" }],
      },
    ],
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.externalId,
  });

  let status = run.status;

  while (["queued", "in_progress", "cancelling"].includes(status)) {
    console.log("Status do run:", status);
    await new Promise((r) => setTimeout(r, 2000));
    const updated = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    status = updated.status;
  }

  // Fora do loop:
  if (status === "completed") {
    const messages = await openai.beta.threads.messages.list(thread.id);
    const text = messages.data.find((m) => m.role === "assistant")?.content[0];

    if (!text) {
      throw new Error("Resposta da IA vazia");
    }

    if (text?.type === "text") {
      const cleanedText = text.text.value.replace(/```html|```/g, "").trim();
      return { message: cleanedText };
    }

    throw new Error("Resposta inesperada da IA");
  }

  throw new Error(`Execução falhou com status: ${status}`);
}

export async function getCosts(file: File): Promise<{ costs: CostItem[] }> {
  if (!file) throw new Error("Arquivo não encontrado");

  const uploaded = await openai.files.create({
    file,
    purpose: "assistants",
  });

  const assistant = await openai.beta.assistants.create({
    name: "Extrator de Custos de Editais",
    instructions: `
      Você irá analisar um edital de licitação em formato PDF.

      Seu objetivo é identificar **todos os itens de custo mencionados** no documento — valores monetários relacionados a materiais, serviços, mão de obra, equipamentos ou qualquer outro elemento orçamentário.

      Para cada item identificado, você deve gerar um objeto no seguinte formato:

      {
        "description": "Descrição resumida do item de custo",
        "category": "mão_de_obra" | "materiais" | "equipamentos" | "serviços" | "outros",
        "value": 1234.56,
        "type": "automatic"
      }

      Classifique o item com base nas seguintes regras:

      - "mão_de_obra": qualquer tipo de trabalho humano (instalação, fiscalização, operação, etc.)
      - "materiais": insumos e matérias-primas (cimento, tinta, cabos, papel, etc.)
      - "equipamentos": ferramentas, máquinas, veículos ou dispositivos utilizados na execução
      - "serviços": atividades de terceiros (aluguel, transporte, limpeza, segurança, etc.)
      - "outros": se não se encaixar em nenhuma das categorias acima

      Se o edital indicar a necessidade de um espaço físico ou estrutura, estime um valor com base em um preço médio por metro quadrado compatível com o tipo de ambiente citado (ex: R$ 50/m² para espaços simples, R$ 100/m² para ambientes climatizados ou especializados). Adapte o valor conforme o contexto se necessário.

      Retorne somente um array JSON puro, com todos os itens encontrados. Não adicione explicações, comentários ou qualquer outro conteúdo além do JSON.
    `,
    tools: [{ type: "file_search" }],
    model: "gpt-4o-mini",
  });

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content:
      "Analise o edital e extraia todos os custos mencionados, classificando-os nas categorias especificadas, e retorne no formato JSON conforme a interface CostItem (sem o campo id).",
    attachments: [
      {
        file_id: uploaded.id,
        tools: [{ type: "file_search" }],
      },
    ],
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  let status = run.status;
  while (["queued", "in_progress", "cancelling"].includes(status)) {
    await new Promise((r) => setTimeout(r, 2000));
    const updated = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    status = updated.status;
    if (status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const text = messages.data.find((m) => m.role === "assistant")
        ?.content[0];

      messages.data.forEach((m) => {
        console.log(m.role, m.content);
      });

      if (text?.type === "text") {
        try {
          const jsonText = text.text.value.replace(/```json|```/g, "").trim();

          const parsed = JSON.parse(jsonText);

          const costs: CostItem[] = parsed.map(
            (item: Omit<CostItem, "id">) => ({
              ...item,
              id: randomUUID(),
            })
          );

          return { costs };
        } catch (err) {
          throw new Error(
            "Erro ao interpretar o JSON retornado pelo assistente"
          );
        }
      }

      throw new Error("Resposta inesperada da IA");
    }
  }

  throw new Error("Execução não concluída");
}

export async function makePdf() {
  const make = new pdfMake({});

}
