import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY não está configurada no arquivo .env");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { message: "API da OpenAI não configurada" },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();
    const {
      razaoSocial,
      cnpj,
      responsavel,
      objeto,
      valor,
      observacoes,
      conteudoEdital,
    } = data;

    const prompt = `Você é um assistente especializado em elaborar propostas técnicas e comerciais para licitações públicas no Brasil. Com base nas informações abaixo, gere um texto profissional para compor a proposta da empresa:

Empresa: ${razaoSocial}
CNPJ: ${cnpj}
Responsável: ${responsavel}
Objeto da proposta: ${objeto}
Valor total estimado: R$ ${valor}
Observações adicionais: ${observacoes || "Não fornecidas"}
${conteudoEdital ? `\nTrecho do edital:\n${conteudoEdital}` : ""}

A proposta deve ser formal, clara e usar termos objetivos. Inclua parágrafos que reforcem a experiência da empresa e compromisso com prazos e conformidade.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em elaboração de propostas técnicas e comerciais para licitações públicas no Brasil.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const proposalText = completion.choices[0].message.content;

    return NextResponse.json({ proposal: proposalText });
  } catch (error: any) {
    console.error("Error generating proposal:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao gerar proposta" },
      { status: 500 }
    );
  }
}
