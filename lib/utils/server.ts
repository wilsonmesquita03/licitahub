"use server"

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

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

    Exemplos:
    - Se o usuário enviou um edital e depois pergunta "Qual o valor do contrato?", a resposta deve ser **"true"**.
    - Se o usuário enviou um arquivo e depois pergunta "Como você está?", a resposta deve ser **"false"**.

    Conversa:
    ${conversationHistory}

    Nova pergunta do usuário: "${newMessage}"
  `.trim();

  try {
    console.log(prompt);

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
