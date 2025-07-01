"use client";

import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarIcon } from "lucide-react";
import Link from "next/link";
import { toggleFollowAction } from "@/app/(dashboard)/opportunities/actions";
import { authClient } from "@/lib/auth-client";
import { Tender } from "@/prisma/generated/prisma";
import { usePathname, useSearchParams } from "next/navigation";

interface TenderCardProps {
  tender: Tender & {
    orgaoEntidade: {
      companyName: string;
    };
    unidadeOrgao: {
      stateAbbr: string;
      stateName: string;
    };
  };
}

interface HighlightedTextProps {
  text: string;
  keywords: string[];
  highlightClassName?: string; // opcional – permite customizar depois
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // evita problemas com caracteres especiais

const HighlightedText: FC<HighlightedTextProps> = ({
  text,
  keywords,
  highlightClassName = "bg-yellow-300 dark:bg-yellow-700 font-semibold",
}) => {
  if (!keywords.length) return <>{text}</>;

  const pattern = new RegExp(
    `\\b(${keywords
      .map((k) => escapeRegex(k) + "(?:s|es)?") // “carro(s)”, “filtro(es)”
      .join("|")})\\b`,
    "gi"
  );

  return (
    <>
      {text.split(pattern).map((part, i) =>
        pattern.test(part) ? (
          <span key={i} className={highlightClassName}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export function TenderCard({ tender }: TenderCardProps) {
  const { data } = authClient.useSession();

  const user = data?.user;

  const params = useSearchParams();
  const pathname = usePathname();

  const keywords =
    pathname === "/opportunities"
      ? params?.get("q")?.split(",")
      : user?.keywords;

  const [isFollowed, setIsFollowed] = useState(
    user ? !!user.followedTenders.find((t) => t.id === tender.id) : false
  );
  const toggleFollow = () => {
    toggleFollowAction(tender.id, isFollowed);
    setIsFollowed(!isFollowed);
  };

  const statusColors = {
    "Divulgada no PNCP": "bg-green-500",
    "Em Andamento": "bg-yellow-500",
    Fechado: "bg-red-500",
    Cancelado: "bg-gray-500",
    Suspensa: "bg-red-500",
  };

  return (
    <Link href={`/opportunities/${tender.id}`} prefetch={false}>
      <Card className="p-4 flex flex-col justify-between hover:shadow-lg transition-shadow h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">
              {tender.orgaoEntidade.companyName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {tender.unidadeOrgao.stateName} • {tender.modalityName}
            </p>
            <p className="text-sm max-w-[75%] mt-2 line-clamp-4">
              <HighlightedText
                text={tender.purchaseObject}
                keywords={keywords || []}
              />
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              toggleFollow();
            }}
            aria-label={isFollowed ? "Deixar de seguir" : "Seguir licitação"}
            className="flex-shrink-0"
          >
            {isFollowed ? (
              <StarIcon className="h-5 w-5 text-yellow-500 fill-current" />
            ) : (
              <Star className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Valor Estimado:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(tender.estimatedTotalValue))}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Badge
              className={
                statusColors[
                  tender.purchaseStatusName as keyof typeof statusColors
                ] || "bg-gray-500"
              }
            >
              {tender.purchaseStatusName === "Divulgada no PNCP"
                ? "Divulgada"
                : tender.purchaseStatusName}
            </Badge>
            <div className="text-right">
              {tender.proposalClosingDate && (
                <p className="text-sm text-muted-foreground">
                  Encerramento:{" "}
                  {new Date(tender.proposalClosingDate).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Publicação:{" "}
                {new Date(tender.publicationDatePncp).toLocaleDateString(
                  "pt-BR"
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
