"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  StarIcon,
  ArrowLeft,
  FileText,
  Clock,
  ChevronUp,
  ChevronDown,
  ClipboardListIcon,
  ClipboardList,
} from "lucide-react";
import { CostEstimate } from "./cost-estimate";
import { Tender, UnidadeOrgao, OrgaoEntidade } from "@prisma/client";
import {
  toggleFollowAction,
  toggleJoinAction,
} from "@/app/(dashboard)/opportunities/actions";
import { useRouter } from "next/navigation";
import { LoginRequiredModal } from "./auth-required";
import { authClient } from "@/lib/auth-client";

type DocumentoPncp = {
  uri: string;
  url: string;
  tipoDocumentoId: number;
  tipoDocumentoDescricao: string;
  titulo: string;
  sequencialDocumento: number;
  dataPublicacaoPncp: string; // ISO string, pode usar Date se for convertido
  cnpj: string;
  anoCompra: number;
  sequencialCompra: number;
  statusAtivo: boolean;
  tipoDocumentoNome: string;
};

interface TenderDetailsProps {
  tender: Tender & {
    unidadeOrgao: UnidadeOrgao;
    orgaoEntidade: OrgaoEntidade;
  };
  files: DocumentoPncp[];
  defaultIsJoined: boolean;
}

export function TenderDetails({
  tender,
  files,
  defaultIsJoined,
}: TenderDetailsProps) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [isFollowed, setIsFollowed] = useState(
    !!data?.user?.followedTenders.find((t) => t.id === tender.id)
  );
  const [isJoined, setIsJoined] = useState(defaultIsJoined);

  const [showAll, setShowAll] = useState(false);

  const statusColors = {
    "Divulgada no PNCP": "bg-green-500",
    "Aberto-Fechado": "bg-yellow-500",
    Suspensa: "bg-red-500",
  };

  const toggleFollow = async () => {
    toggleFollowAction(tender.id, isFollowed);
    setIsFollowed(!isFollowed);
  };

  const toggleJoin = async () => {
    if (isJoined) {
      await toggleJoinAction(tender.id, false);
      setIsJoined(false);
    } else {
      await toggleJoinAction(tender.id, true);
      if (!isFollowed) {
        await toggleFollowAction(tender.id, false);
        setIsFollowed(true);
      }
      setIsJoined(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-4">
          <LoginRequiredModal>
            <Button
              onClick={toggleJoin}
              variant={isJoined ? "default" : "outline"}
              className="gap-2"
            >
              {isJoined ? (
                <ClipboardListIcon className="h-4 w-4 fill-current" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              {isJoined ? "Participando" : "Participar da licitação"}
            </Button>
          </LoginRequiredModal>
          <LoginRequiredModal>
            <Button
              onClick={toggleFollow}
              variant={isFollowed ? "default" : "outline"}
              className="gap-2"
              disabled={isJoined}
            >
              {isFollowed ? (
                <StarIcon className="h-4 w-4 fill-current" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              {isFollowed ? "Seguindo" : "Seguir Licitação"}
            </Button>
          </LoginRequiredModal>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {tender.orgaoEntidade.companyName}
          </h1>
          <Badge
            className={`${
              statusColors[
                tender.purchaseStatusName as keyof typeof statusColors
              ]
            } text-white`}
          >
            {tender.purchaseStatusName === "Divulgada no PNCP"
              ? "Divulgada"
              : tender.purchaseStatusName}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1 flex-grow">
            <span>{tender.purchaseObject}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Publicado em:{" "}
              {tender.publicationDatePncp.toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 h-fit">
          <h2 className="text-xl font-semibold">Detalhes da Licitação</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Valor Estimado:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(tender.estimatedTotalValue)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Encerramento de Propostas:</span>
              <span className="font-medium">
                {tender.proposalClosingDate
                  ? tender.proposalClosingDate.toLocaleDateString("pt-BR")
                  : "Indefinido"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Modalidade:</span>
              <span className="font-medium">{tender.modalityName}</span>
            </div>

            <div className="flex justify-between">
              <span>Número do processo</span>
              <span className="font-medium">{tender.process}</span>
            </div>

            <div className="flex justify-between">
              <span>Modo de Disputa:</span>
              <span className="font-medium">{tender.disputeModeName}</span>
            </div>

            <div className="flex justify-between">
              <span>Estado</span>
              <span className="font-medium">
                {tender.unidadeOrgao.stateName}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Documentos e Anexos</h2>
            {tender.sourceSystemLink && (
              <a
                href={tender.sourceSystemLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="link" size="sm">
                  Ver mais
                </Button>
              </a>
            )}
          </div>

          {files
            .slice(0, showAll ? files.length : 3)
            .map(({ uri, tipoDocumentoDescricao, tipoDocumentoId, titulo }) => (
              <div key={uri} className="space-y-2">
                <div className="flex items-center gap-2 p-3 border rounded">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>
                    {tipoDocumentoId === 16 ? titulo : tipoDocumentoDescricao}
                  </span>
                  <a
                    href={uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto"
                  >
                    <Button variant="link" size="sm">
                      Acessar
                    </Button>
                  </a>
                </div>
              </div>
            ))}

          {files.length > 3 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="link"
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver mais
                  </>
                )}
              </Button>
            </div>
          )}

          {files.length === 0 && (
            <div className="text-sm text-gray-500 space-y-2">
              <p>Nenhum documento disponível no momento.</p>
              <p>
                Por favor, verifique diretamente no site oficial da licitação
                para obter os documentos completos.
              </p>
            </div>
          )}
        </Card>

        <CostEstimate tender={tender} />
      </div>
    </div>
  );
}
