import { TenderList } from "@/components/tender-list";
import { prisma } from "@/lib/prisma";
import { Compra } from "@/types/pncp";
import { Tender } from "@/types/tender";
import axios from "axios";

async function getTenders() {
  "use server";

  const tenders = await prisma.tender.findMany({
    include: {
      unidadeOrgao: true,
      orgaoEntidade: true,
    },
  });

  return tenders
}

export default async function RadarPage() {
  const tenders = await getTenders();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Radar de Oportunidades</h1>
      </div>

      <TenderList tenders={tenders} />
    </div>
  );
}
