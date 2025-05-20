// app/(routes)/radar/page.tsx
import { TenderList } from "@/components/tender-list";
import { PaginationControls } from "@/components/pagination-controls";
import { TenderFilters } from "@/components/tender-filters";
import { getTenders } from "@/lib/db/queries";

export default async function RadarPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    uf?: string;
    q?: string;
    disputeModeName?: string;
    modalityName?: string;
  }>;
}) {
  const params = await searchParams;
  const { tenders, page, totalPages, limit } = await getTenders(params);

  return (
    <div className="container mx-auto p-4 space-y-6 relative">
      <h1 className="text-2xl font-bold">Radar de Oportunidades</h1>

      <TenderFilters />
      {/* @ts-expect-error Server Component */}
      <TenderList tenders={tenders} />

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
      />
    </div>
  );
}
