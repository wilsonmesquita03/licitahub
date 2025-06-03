"use client";

import { OrgaoEntidade, Tender, UnidadeOrgao } from "@/prisma/generated/prisma";
import { TenderCard } from "./tender-card";

interface TenderListProps {
  tenders: (Tender & {
    orgaoEntidade: OrgaoEntidade;
    unidadeOrgao: UnidadeOrgao;
  })[]; // Cada tender é um objeto com as propriedades de Tender e suas relações
}

export function TenderList({ tenders }: TenderListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {tenders.map((tender) => (
        <TenderCard key={tender.id} tender={tender} />
      ))}
    </div>
  );
}
