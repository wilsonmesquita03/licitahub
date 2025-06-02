//@ts-nocheck

import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import axios from "axios";
import OpenAI from "openai";
import AdmZip from "adm-zip";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id: tenderId } = await params;

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: { orgaoEntidade: true },
  });

  if (!tender || !tender.orgaoEntidade) {
    return new Response("Licitação não encontrada", { status: 404 });
  }

  // 1. Buscar arquivos no PNCP
  const { data: documentos } = await axios.get(
    `https://pncp.gov.br/pncp-api/v1/orgaos/${tender.orgaoEntidade.cnpj}/compras/${tender.purchaseYear}/${tender.purchaseSequence}/arquivos`
  );

  const edital = documentos.find(
    (doc) => doc.tipoDocumentoNome === "Edital" && doc.titulo.endsWith(".zip")
  );

  if (!edital) {
    return new Response("Arquivo de edital não encontrado", { status: 404 });
  }

  // 2. Baixar o arquivo .zip
  const zipResponse = await axios.get<ArrayBuffer>(edital.url, {
    responseType: "arraybuffer",
  });

  const zip = new AdmZip(Buffer.from(zipResponse.data));

  // 3. Extrair o primeiro PDF ou arquivo .txt
  const zipEntries = zip.getEntries();
  const editalFile = zipEntries.find((e) =>
    e.entryName.toLowerCase().match(/\.(pdf|txt)$/)
  );

  if (!editalFile) {
    return new Response("Nenhum PDF ou TXT encontrado no .zip", {
      status: 400,
    });
  }

  const buffer = editalFile.getData();

  // 4. Criar arquivo para file_search
  const file = await openai.files.create({
    file: Buffer.from(buffer), // ← apenas o Buffer
    purpose: "assistants",
  });

  // 5. Criar thread e enviar mensagem com search
  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content:
      `Você é um assistente especializado em análise de editais de licitação.\n\n` +
      `Analise o edital anexado e gere os campos da proposta (name, label, type)\n` +
      `e um template pdfmake com placeholders.\n\n` +
      `Retorne apenas um JSON com as propriedades "fields" e "pdfmakeTemplate".`,
    attachments: [
      {
        file_id: file.id,
      },
    ],
  });

  // 6. Executar a IA no thread
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.ASSISTANT_ID!,
  });

  // Você pode esperar ou consultar status até terminar
  // return run.id para continuar polling

  return new Response(
    JSON.stringify({
      message: "Processamento iniciado",
      runId: run.id,
      threadId: thread.id,
    }),
    { status: 200 }
  );
}
