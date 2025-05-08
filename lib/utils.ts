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