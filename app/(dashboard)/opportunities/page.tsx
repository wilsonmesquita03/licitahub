// app/(routes)/radar/page.tsx
import { TenderList } from "@/components/tender-list";
import { prisma } from "@/lib/prisma";
import { PaginationControls } from "@/components/pagination-controls";

export default async function RadarPage({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 50;

  const tenders = await prisma.tender.findMany({
    skip: (currentPage - 1) * limit,
    take: limit,
    include: {
      unidadeOrgao: true,
      orgaoEntidade: true,
    },
  });

  const totalTenders = await prisma.tender.count();
  const totalPages = Math.ceil(totalTenders / limit);

  return (
    <div className="container mx-auto p-4 space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Radar de Oportunidades</h1>
      </div>

      <TenderList tenders={tenders} />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        limit={limit}
      />
    </div>
  );
}
