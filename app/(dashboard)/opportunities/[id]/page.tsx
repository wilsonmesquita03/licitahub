import { notFound } from "next/navigation";
import { TenderDetails } from "@/components/tender-details";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { Compra } from "@/app/api/tender-by-publish/route";
import { updateTender } from "@/lib/db/queries";
import { getSession } from "@/lib/session";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

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

async function getTender(id: string) {
  "use server";

  const session = await getSession();

  const include: Prisma.TenderInclude = {
    unidadeOrgao: true,
    orgaoEntidade: true,
    joinedBy: {
      where: {
        id: session.user?.id,
      },
    },
  };

  const tender = await prisma.tender.findUnique({
    where: {
      id,
    },
    include,
  });

  if (!tender) {
    return {
      tender: null,
      files: [],
    };
  }

  axios
    .get<Compra>(
      `https://pncp.gov.br/api/consulta/v1/orgaos/${tender?.orgaoEntidade.cnpj}/compras/${tender.purchaseYear}/${tender.purchaseSequence}`
    )
    .then(async (response) => {
      const tender = response.data;

      await updateTender(
        { id, pncpControlNumber: tender.numeroControlePNCP },
        {
          purchaseNumber: tender.numeroCompra,
          process: tender.processo,
          purchaseYear: tender.anoCompra,
          purchaseSequence: tender.sequencialCompra,
          modalityId: tender.modalidadeId,
          modalityName: tender.modalidadeNome,
          instrumentTypeName: tender.tipoInstrumentoConvocatorioNome,
          purchaseStatusId: tender.situacaoCompraId,
          purchaseStatusName: tender.situacaoCompraNome,
          purchaseObject: tender.objetoCompra,
          estimatedTotalValue: tender.valorTotalEstimado,
          approvedTotalValue: tender.valorTotalHomologado,
          inclusionDate: new Date(tender.dataInclusao),
          publicationDatePncp: new Date(tender.dataPublicacaoPncp),
          updateDate: new Date(tender.dataAtualizacao),
          proposalOpeningDate: tender.dataAberturaProposta
            ? new Date(tender.dataAberturaProposta)
            : null,
          proposalClosingDate: tender.dataEncerramentoProposta
            ? new Date(tender.dataEncerramentoProposta)
            : null,
          pncpControlNumber: tender.numeroControlePNCP,
          globalUpdateDate: new Date(tender.dataAtualizacaoGlobal),
          disputeModeId: tender.modoDisputaId,
          disputeModeName: tender.modoDisputaNome,
          srp: tender.srp,
          userName: tender.usuarioNome,
          sourceSystemLink: tender.linkSistemaOrigem,
          electronicProcessLink: tender.linkProcessoEletronico,
        }
      );
    });

  const { data: fileResponse } = await axios
    .get<DocumentoPncp[]>(
      `https://pncp.gov.br/pncp-api/v1/orgaos/${tender?.orgaoEntidade.cnpj}/compras/${tender?.purchaseYear}/${tender?.purchaseSequence}/arquivos`
    )
    .catch(() => ({
      data: [],
    }));

  return { tender, files: fileResponse };
}

export default async function TenderPage({ params }: PageProps) {
  const { tender, files } = await getTender((await params).id);

  if (!tender) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <TenderDetails
        tender={tender}
        files={files}
        defaultIsJoined={tender.joinedBy.length > 0}
      />
    </div>
  );
}
