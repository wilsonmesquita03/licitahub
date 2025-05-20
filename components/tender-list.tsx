"use client";

import { TenderCard } from "./tender-card";
import { OrgaoEntidade, Tender, UnidadeOrgao } from "@prisma/client";

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
