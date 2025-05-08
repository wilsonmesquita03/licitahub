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
  Landmark,
} from "lucide-react";
import Link from "next/link";
import { CostEstimate } from "./cost-estimate";
import { Tender, UnidadeOrgao, OrgaoEntidade } from "@prisma/client";

interface TenderDetailsProps {
  tender: Tender & {
    unidadeOrgao: UnidadeOrgao;
    orgaoEntidade: OrgaoEntidade;
  };
}

export function TenderDetails({ tender }: TenderDetailsProps) {
  const [isFollowed, setIsFollowed] = useState(false);

  const statusColors = {
    "Divulgada no PNCP": "bg-green-500",
    "Aberto-Fechado": "bg-yellow-500",
    Suspensa: "bg-red-500",
  };

  const toggleFollow = () => setIsFollowed(!isFollowed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/opportunities" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Radar
        </Link>
        <Button
          onClick={toggleFollow}
          variant={isFollowed ? "default" : "outline"}
          className="gap-2"
        >
          {isFollowed ? (
            <StarIcon className="h-4 w-4 fill-current" />
          ) : (
            <Star className="h-4 w-4" />
          )}
          {isFollowed ? "Seguindo" : "Seguir Licitação"}
        </Button>
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
            {tender.purchaseStatusName.replace("_", " ")}
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
        <Card className="p-6 space-y-4">
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
                {tender.proposalClosingDate.toLocaleDateString("pt-BR")}
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
          <h2 className="text-xl font-semibold">Documentos e Anexos</h2>

          {tender.sourceSystemLink ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 border rounded">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Documento do Processo</span>
                <a
                  href={tender.sourceSystemLink}
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
          ) : (
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

      <div className="flex gap-4 justify-end">
        {tender.electronicProcessLink ? (
          <Link href={tender.electronicProcessLink}>
            <Button>Enviar Proposta</Button>
          </Link>
        ) : (
          <Button className="cursor-not-allowed" disabled>Enviar Proposta (Link Indisponível)</Button>
        )}
      </div>
    </div>
  );
}
