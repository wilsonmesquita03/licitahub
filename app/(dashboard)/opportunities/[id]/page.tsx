import { notFound } from "next/navigation";
import { TenderDetails } from "@/components/tender-details";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTender(id: string) {
  "use server";

  const include: Prisma.TenderInclude = {
    unidadeOrgao: true,
    orgaoEntidade: true,
  };

  const tender = await prisma.tender.findUnique({
    where: {
      id,
    },
    include,
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
