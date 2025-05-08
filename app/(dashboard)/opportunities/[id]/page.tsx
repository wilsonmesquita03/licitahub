import { notFound } from "next/navigation";
import { mockTenders } from "@/data/mock-tenders";
import { TenderDetails } from "@/components/tender-details";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTender(id: string) {
  "use server";

  const tender = await prisma.tender.findUnique({
    where: {
      id,
    },
    include: {
      unidadeOrgao: true,
      orgaoEntidade: true,
    },
  });

  return tender;
}

export default async function TenderPage({ params }: PageProps) {
  const tender = await getTender((await params).id);

  if (!tender) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <TenderDetails tender={tender} />
    </div>
  );
}
