// app/(routes)/radar/page.tsx
import { TenderList } from "@/components/tender-list";
import { prisma } from "@/lib/prisma";
import { PaginationControls } from "@/components/pagination-controls";
import { TenderFilters } from "@/components/tender-filters";
import { Prisma } from "@prisma/client";

export default async function RadarPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    uf?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
    disputeModeName?: string;
    modalityName?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params?.page || "1");
  const limit = parseInt(params?.limit || "50");
  const uf = params?.uf;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const query = params?.q;

  const where: Prisma.TenderWhereInput = {
    ...(uf && {
      unidadeOrgao: {
        stateAbbr: uf,
      },
    }),
    ...(startDate || endDate
      ? {
          publicationDatePncp: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),

    ...(query && {
      OR: query.split(",").map((qbroke) => ({
        purchaseObject: {
          contains: qbroke,
          mode: "insensitive",
        },
        unidadeOrgao: {
          cityName: {
            contains: qbroke,
            mode: "insensitive",
          },
          unitName: {
            contains: qbroke,
            mode: "insensitive",
          },
        },
        orgaoEntidade: {
          companyName: {
            contains: qbroke,
            mode: "insensitive",
          },
        },
      })),
    }),
    ...(params?.disputeModeName && {
      disputeModeName: params.disputeModeName,
    }),
    ...(params?.modalityName && {
      modalityName: params.modalityName,
    }),
    proposalClosingDate: {
      gte: new Date(),
    },
  };

  const [tenders, totalTenders] = await Promise.all([
    prisma.tender.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      include: {
        unidadeOrgao: true,
        orgaoEntidade: true,
      },
    }),
    prisma.tender.count({ where }),
  ]);

  const totalPages = Math.ceil(totalTenders / limit);

  return (
    <div className="container mx-auto p-4 space-y-6 relative">
      <h1 className="text-2xl font-bold">Radar de Oportunidades</h1>

      <TenderFilters />

      <TenderList tenders={tenders} />
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
      />
    </div>
  );
}
