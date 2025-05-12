import { OnboardingFormData } from '@/app/onboarding/onboarding-provider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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