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

import type { CoreAssistantMessage, CoreToolMessage, UIMessage } from "ai";
import { Document } from "@prisma/client";

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
  return text.replace('<has_function_call>', '');
}