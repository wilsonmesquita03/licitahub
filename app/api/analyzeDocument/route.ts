// app/api/analyzeDocument/route.ts
console.log("🔥 chamei o route.ts do app/api/analyzeDocument");

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Função de chunking
function chunkText(text: string, maxChars = 20000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars));
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: 'API da OpenAI não configurada' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'Arquivo muito grande' }, { status: 413 });
    }

    // Passo 1: converter PDF em texto
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const { text: editalTexto } = await pdfParse(buffer);

    // Passo 2: chunking
    const fatias = chunkText(editalTexto, 20000);
    console.log(`🔖 Dividido em ${fatias.length} partes`);

    // Passo 3: chamar OpenAI em cada fatia
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resultados: string[] = [];

    for (const fatia of fatias) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um especialista em licitações públicas.' },
          {
            role: 'user',
            content: `Com base no trecho abaixo, gere um checklist com:
1) documentos obrigatórios,
2) prazos importantes,
3) pontos de atenção.

Trecho:
"""
${fatia}
"""`,
          },
        ],
        temperature: 0.4,
      });
      resultados.push(completion.choices[0].message.content);
    }

    // Passo 4: juntar tudo e devolver
    const respostaFinal = resultados.join('\n\n---\n\n');
    return NextResponse.json({ analysis: respostaFinal });
  } catch (err: any) {
    console.error('Erro interno:', err);
    return NextResponse.json({ message: 'Erro interno ao processar o edital.' }, { status: 500 });
  }
}
