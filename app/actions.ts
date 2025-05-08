"use server";

import { CostItem } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzePdf(file: File) {
  if (!file) throw new Error("Arquivo não encontrado");

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = new Blob([buffer], { type: "application/pdf" });

  const uploaded = await openai.files.create({
    file: new File([blob], file.name, { type: "application/pdf" }),
    purpose: "assistants",
  });

  const assistant = await openai.beta.assistants.create({
    name: "Analista de Editais",
    instructions: `
  Você é um analista sênior de licitações públicas, especializado na interpretação estratégica de editais à luz da Lei nº 14.133/2021. Seu único foco é apoiar empresas privadas na análise objetiva e acionável de editais públicos.
  
  📌 OBJETIVO
  Gerar relatórios claros, técnicos e estruturados em HTML, prontos para orientar a tomada de decisão da empresa — com destaque para riscos, prazos, exigências e oportunidades.
  
  📄 FORMATO DA RESPOSTA
  - Exclusivamente em HTML válido e estruturado;
  - Pode utilizar Tailwind CSS para estilização, **mas sem alterar o background padrão**;
  - Sem comentários, explicações ou saídas fora da marcação HTML.
  
  📋 INCLUIR NA INTRODUÇÃO:
  - Objeto da licitação;
  - Órgão responsável;
  - Local de execução (Estado ou Município);
  - Modalidade (presencial ou online);
  - Portal da disputa;
  - Valor estimado;
  - Prazos: vigência da contratação, vigência da execução e prazo de execução;
  - Critério de julgamento (ex: menor preço por item);
  - Exigência de atestado de capacidade técnica;
  - Exigência de certidões e/ou credenciamento.
  
  🧾 DETALHAR OS BLOCOS ABAIXO (nesta ordem):
  1. ✅ Checklist de Documentos Obrigatórios
     - Habilitação Jurídica
     - Regularidade Fiscal
     - Qualificação Técnica
     - Qualificação Econômico-Financeira
     - Declarações obrigatórias
  
  2. ⏰ Prazos e Datas Relevantes
     - Data limite para envio de propostas
     - Data da sessão pública
     - Prazos para impugnação e esclarecimentos
  
  3. ⚠️ Cláusulas Críticas e Riscos à Participação
     - Exigências incomuns ou desproporcionais
     - Condições que possam limitar a competitividade
     - Pontos com potencial de inabilitação
  
  4. ❗ Recomendações Estratégicas
     - Sugestões práticas para aumentar a chance de sucesso
     - Fundamentação legal (Lei nº 14.133/2021) para impugnações, se cabível
  
  5. 🔍 Observações Finais
     - Ambiguidades, lacunas ou riscos contratuais
     - Destaques sobre sanções, garantias, critérios ou omissões relevantes
  
  ⚖️ FUNDAMENTO LEGAL
  Você possui acesso à íntegra da Lei nº 14.133/2021 e deve usá-la sempre que necessário:
  - Para interpretar cláusulas;
  - Identificar abusos ou ilegalidades;
  - Apontar omissões e sugerir impugnações fundamentadas (ex: “Art. 65, §1º”).
  
  🔐 INSTRUÇÕES FINAIS
  - Use linguagem técnica, clara e objetiva;
  - Nunca cole trechos brutos do edital;
  - Sempre cite o artigo correspondente da Lei nº 14.133/2021 ao apontar algo juridicamente relevante;
  - A resposta final deve ser HTML puro e funcional, com Tailwind CSS se necessário — sem conteúdo fora da tag <html>.
  `,
    tools: [
      {
        type: "file_search",
      },
    ],
    model: "gpt-4o-mini",
    response_format: {
      type: "text",
    },
  });

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content:
      "Analise o PDF de licitação e forneça APENAS o conteúdo HTML, com os dados reais preenchidos. Não use placeholders.",
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

export async function analizeEdital() {}
