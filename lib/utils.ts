import { OnboardingFormData } from "@/app/onboarding/onboarding-provider";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizarTexto(texto: string) {
  const preposicoes = ["de", "da", "do", "das", "dos", "e"];
  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra, i) => {
      if (i !== 0 && preposicoes.includes(palavra)) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

export function buildCompanyInfoPrompt(data: OnboardingFormData): string {
  const lines = [];

  if (data.companyName) {
    lines.push(`- companyName: ${data.companyName}`);
  }
  if (data.cnpj) {
    lines.push(`- cnpj: ${data.cnpj}`);
  }
  if (data.productServiceDescription) {
    lines.push(
      `- productServiceDescription: ${data.productServiceDescription}`
    );
  }
  if (data.operationType) {
    lines.push(`- operationType: ${data.operationType}`);
  }
  if (data.annualRevenue) {
    lines.push(`- annualRevenue: ${data.annualRevenue}`);
  }
  if (data.employeesCount) {
    lines.push(`- employeesCount: ${data.employeesCount}`);
  }

  return lines.join("\n");
}

import {
  type CoreAssistantMessage,
  type CoreToolMessage,
  type UIMessage,
} from "ai";
import { Document } from "@/prisma/generated/prisma";
import { ProposalData } from "@/types/proposal";
import { TDocumentDefinitions } from "pdfmake/interfaces";

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export function fileToDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      return reject(
        new TypeError("Esperava receber Blob ou File, mas veio outro tipo")
      );
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file); // agora é seguro
  });
}

export async function generateProposalDoc(
  data: ProposalData
): Promise<TDocumentDefinitions> {
  const {
    letterhead,
    biddingNumber,
    company,
    representative,
    items,
    validity,
    locationAndDate,
  } = data;

  const tableBody = [
    [
      { text: "Item", bold: true },
      { text: "Descrição", bold: true },
      { text: "Unidade", bold: true },
      { text: "Qtd.", bold: true },
      { text: "Valor Unitário (R$)", bold: true },
      { text: "Valor Total (R$)", bold: true },
    ],
    ...items.map((item, index) => [
      String(index + 1).padStart(2, "0"),
      item.description,
      item.unity,
      String(item.quantity),
      item.unitPrice.toFixed(2).replace(".", ","),
      item.totalPrice,
    ]),
  ];

  let letterheadSrc: string | undefined;

  if (letterhead) {
    if (typeof letterhead === "string") {
      // Já é Data URL
      letterheadSrc = letterhead;
    } else if (letterhead instanceof FileList) {
      // Primeiro arquivo do <input type="file">
      if (letterhead.length) {
        letterheadSrc = await fileToDataURL(letterhead[0]);
      }
    } else if (letterhead instanceof Blob) {
      // Único arquivo já isolado
      letterheadSrc = await fileToDataURL(letterhead);
    }
  }

  return {
    content: [
      {
        image: letterheadSrc ?? "(EM TIMBRADO)",
        fit: [150, 75], // ou width: 515, se preferir
        alignment: "center",
        margin: [0, 0, 0, 10], // 10 pt abaixo costuma bastar
      },
      {
        text: "PROPOSTA DE PREÇO",
        style: "title",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        text: `PREGÃO ELETRÔNICO Nº ${biddingNumber}`,
        alignment: "center",
        margin: [0, 0, 0, 20],
      },

      { text: "DADOS DA EMPRESA (PROPONENTE)", style: "sectionHeader" },
      {
        ul: [
          `Razão Social: ${company.companyName}`,
          `CNPJ nº: ${company.cnpj}`,
          `Inscrição Estadual: ${company.stateRegistration}`,
          `Endereço: ${company.address}`,
          `E-mail: ${company.email}`,
          `Telefone: ${company.phone}`,
          `Dados Bancários: ${company.bankDetails}`,
        ],
      },

      { text: "\nDADOS DO REPRESENTANTE LEGAL", style: "sectionHeader" },
      {
        ul: [
          `Nome: ${representative.name}`,
          `Nacionalidade: ${representative.nationality}`,
          `Naturalidade: ${representative.birthPlace}`,
          `Estado Civil: ${representative.maritalStatus}`,
          `Profissão: ${representative.occupation}`,
          `CPF nº: ${representative.cpf}`,
          `R.G nº: ${representative.rg}`,
          `Órgão Expedidor: ${representative.rgIssuer}`,
          `Endereço: ${representative.address}`,
          `E-mail: ${representative.email}`,
          `Telefone: ${representative.phone}`,
        ],
      },

      {
        text:
          "\nA empresa acima identificada, após tomar conhecimento de todas as condições estabelecidas no Termo de Referência, no Edital nº " +
          biddingNumber +
          " (e anexos), por seu representante legal, abaixo assinado, apresenta a seguinte proposta de preços:\n",
        margin: [0, 10, 0, 10],
      },

      {
        table: {
          widths: ["auto", "*", "auto", "auto", "auto", "auto"],
          body: tableBody,
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },

      {
        text: `Validade da Proposta: ${validity}`,
        margin: [0, 0, 0, 10],
      },

      {
        text: `Declaramos que no preço proposto estão inclusos todos os custos necessários para o fornecimento do objeto, como todas as despesas com a mão de obra a ser utilizada, bem como todos os tributos, encargos trabalhistas, comerciais e quaisquer outras despesas que incidam ou venham a incidir sobre o objeto desta licitação, e que influenciem na formação dos preços desta Proposta.\n\nDeclaramos, ainda, conhecer a legislação de regência desta licitação e que o objeto será fornecido de acordo com as condições estabelecidas neste Edital e seus anexos, que conhecemos e aceitamos em todos os seus termos.`,
        margin: [0, 0, 0, 20],
      },

      {
        text: `${locationAndDate}\n\n`,
        margin: [0, 0, 0, 20],
      },

      {
        columns: [
          { width: "*", text: "" },
          {
            width: "auto",
            stack: [
              {
                text: "_______________________________________",
                alignment: "center",
              },
              { text: "Representante Legal", alignment: "center" },
            ],
          },
          { width: "*", text: "" },
        ],
      },
    ],

    styles: {
      header: { fontSize: 10, italics: true },
      title: { fontSize: 14, bold: true },
      sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
    },
  };
}

export const formatToBRL = (value: number) => {
  const number = value;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const parseBRLToFloat = (value: string) => {
  const clean = value.replace(/[^\d]/g, "");
  return parseFloat(clean) / 100 || 0;
};
