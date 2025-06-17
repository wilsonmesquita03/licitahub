import { prisma } from "@/lib/prisma";
import AdmZip from "adm-zip";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type DocumentoPncp = {
  uri: string;
  url: string;
  tipoDocumentoId: number;
  tipoDocumentoDescricao: string;
  titulo: string;
  sequencialDocumento: number;
  dataPublicacaoPncp: string; // ISO string, pode usar Date se for convertido
  cnpj: string;
  anoCompra: number;
  sequencialCompra: number;
  statusAtivo: boolean;
  tipoDocumentoNome: string;
};

function detectFileType(buffer: Buffer): string {
  if (buffer.length < 4) {
    return "unknown";
  }

  // Magic numbers
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
  const zipSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK..

  function startsWith(signature: Buffer, buf: Buffer): boolean {
    for (let i = 0; i < signature.length; i++) {
      if (buf[i] !== signature[i]) {
        return false;
      }
    }
    return true;
  }

  if (startsWith(pdfSignature, buffer)) {
    return "pdf";
  }

  if (startsWith(zipSignature, buffer)) {
    try {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      const hasDocxFiles = entries.some(
        (entry) => entry.entryName === "word/document.xml"
      );

      if (hasDocxFiles) {
        return "docx";
      }

      return "zip";
    } catch (e) {
      return "unknown";
    }
  }

  return "unknown";
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const tender = await prisma.tender.findUnique({
    where: {
      id,
    },
    select: {
      orgaoEntidade: {
        select: {
          cnpj: true,
        },
      },
      purchaseYear: true,
      purchaseSequence: true,
    },
  });

  const files: { fileId: string; fileName: string }[] = [];

  const fileResponse = await axios.get<DocumentoPncp[]>(
    `https://pncp.gov.br/pncp-api/v1/orgaos/${tender?.orgaoEntidade.cnpj}/compras/${tender?.purchaseYear}/${tender?.purchaseSequence}/arquivos`
  );

  for (const file of fileResponse.data) {
    const downloadedFileResponse = await axios.get(file.url, {
      responseType: "arraybuffer",
    });

    const contentType = downloadedFileResponse.headers["content-type"];
    const buffer = Buffer.from(downloadedFileResponse.data);
    const fileType = detectFileType(buffer);

    if (fileType === "zip") {
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;

        const name = entry.entryName.toLowerCase();

        if (!name.endsWith(".pdf") && !name.endsWith(".docx")) continue;

        const fileBuffer = entry.getData();
        const uploaded = await openai.files.create({
          file: await toFile(fileBuffer, entry.entryName),
          purpose: "assistants",
        });

        files.push({
          fileId: uploaded.id,
          fileName: entry.entryName,
        });
      }
    } else {
      // Detectar se é PDF ou DOCX pelo content-type
      const isPdfOrDocx =
        contentType === "application/pdf" ||
        contentType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isPdfOrDocx) continue;

      const uploaded = await openai.files.create({
        file: await toFile(buffer, file.titulo),
        purpose: "assistants",
      });

      files.push({
        fileId: uploaded.id,
        fileName: file.titulo,
      });
    }
  }

  const oldAssistId = "asst_WvmjcNlFA5O0xFjUQ3Cw7Kik"

  const response = await openai.beta.threads.createAndRun({
    model: "gpt-4o-mini",
    assistant_id: "asst_UPz5lk9iSTgbAOfcl52hkRMu",
    tools: [
      {
        type: "file_search",
      },
    ],
    instructions: "Deve gerar com base nos arquivos anexados",
    thread: {
      messages: [
        {
          attachments: files.map((file) => ({
            file_id: file.fileId,
            tools: [
              {
                type: "file_search",
              },
            ],
          })),
          content: "Sua resposta deve conter APENAS o JSON",
          role: "user",
        },
      ],
    },
  });

  const assistantResponse = await openai.beta.threads.messages.list(
    response.thread_id
  );

  let message = assistantResponse.data.find(
    (message) => message.role === "assistant"
  )?.content;

  while (!message) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const assistantResponse = await openai.beta.threads.messages.list(
      response.thread_id
    );
    message = assistantResponse.data.find(
      (message) => message.role === "assistant"
    )?.content;
  }

  files.forEach(({ fileId }) => {
    openai.files.del(fileId);
  });

  return NextResponse.json(message);
}
