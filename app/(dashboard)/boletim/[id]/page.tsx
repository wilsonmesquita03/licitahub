// ts-nocheck
import { EditKeywordsModal } from "@/components/edit-keywords";
import { PaginationControls } from "@/components/pagination-controls";
import { TenderList } from "@/components/tender-list";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getTenders } from "@/lib/db/queries";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { BackBtn } from "./back-btn";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    uf?: string;
    q?: string;
    disputeModeName?: string;
    modalityName?: string;
  }>;
}) {
  const { id } = await params;
  const searchParamsData = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return unauthorized();

  const boletim = await prisma.sentBoletim.findUnique({ where: { id } });

  if (!boletim) return notFound();

  const { tenders, page, totalPages, limit } = await getTenders(
    { ...searchParamsData, q: boletim.keywords.join(",") },
    boletim.rangeStart,
    boletim.rangeEnd
  );

  return (
    <div className="max-w-6xl mx-auto px-8 py-4 pt-14 h-full">
      <div className="my-4">
        <Link href="/boletim">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-4xl font-bold">Boletim</h1>
        <p className="text-muted-foreground">Palavras chaves neste boletim:</p>
        <div className="flex gap-2 my-4">
          {boletim.keywords.map((keyword) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      </div>

      <div className="my-4">
        <EditKeywordsModal
          boletimId={boletim.id}
          initialKeywords={boletim.keywords}
        />
      </div>

      <p className="text-muted-foreground my-4">
        {(tenders as []).length < 50
          ? `${(tenders as []).length} Licitações encontradas`
          : `Aproximadamente ${
              (tenders as [])?.length * totalPages
            } licitações encontradas`}
      </p>
      {/* @ts-expect-error Server Component */}
      <TenderList tenders={tenders} />

      <PaginationControls
        currentPage={page}
        totalPages={totalPages || 1}
        limit={limit}
      />
    </div>
  );
}
