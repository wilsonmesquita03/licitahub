import "server-only";

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
