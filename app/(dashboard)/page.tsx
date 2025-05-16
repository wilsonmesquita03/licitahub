import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bell, FileSearch, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { differenceInDays, differenceInHours } from "date-fns";

export default async function Dashboard() {
  const session = await getSession();

  if (!session.user) {
    redirect("/opportunities");
  }

  const tenderCount = await prisma.tender.count({
    where: {
      proposalClosingDate: {
        gte: new Date(),
      },
    },
  });

  const tenderFavorited = await prisma.tender.findMany({
    where: {
      followedBy: {
        some: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
      purchaseObject: true,
      orgaoEntidade: {
        select: {
          companyName: true,
        },
      },
      estimatedTotalValue: true,
      proposalClosingDate: true,
      process: true,
    },
  });

  const importantDeadlines = tenderFavorited
    .filter((tender) => {
      const diffInHours = differenceInHours(
        tender.proposalClosingDate,
        new Date()
      );
      return diffInHours > 0;
    })
    .map((tender) => {
      const diffInDays = differenceInDays(
        tender.proposalClosingDate,
        new Date()
      );

      if (diffInDays >= 1) {
        return {
          ...tender,
          timeLeft: `${diffInDays} dia${diffInDays > 1 ? "s" : ""}`,
        };
      } else {
        const diffInHours = differenceInHours(
          tender.proposalClosingDate,
          new Date()
        );
        return {
          ...tender,
          timeLeft: `${diffInHours} hora${diffInHours > 1 ? "s" : ""}`,
        };
      }
    });

  return (
    <>
      <div className="flex min-h-screen bg-background">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Oportunidades Abertas
                </CardTitle>
                <Link href="/opportunities">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenderCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Editais em Análise
                </CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenderFavorited.length}
                </div>
                {/* 
                  <p className="text-xs text-muted-foreground">
                    2 pendentes de revisão
                  </p>
                */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Propostas em Construção
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  1 com prazo próximo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Sucesso
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
                <p className="text-xs text-muted-foreground">+5% este mês</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <Alert className="mb-8">
            <AlertTitle>Prazos Importantes</AlertTitle>
            <AlertDescription>
              <ul className="space-y-1 mt-4">
                {importantDeadlines.map((tender) => (
                  <li
                    key={tender.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {tender.orgaoEntidade.companyName} - {tender.process}
                    </span>
                    <Badge variant="destructive">{tender.timeLeft}</Badge>
                  </li>
                ))}
              </ul>
              {importantDeadlines.length === 0 && (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Nenhuma oportunidade favoritada com prazo definido
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    <Link href="/opportunities">
                      Ver todas as Oportunidades
                    </Link>
                  </p>
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Recent Activities */}
          <Tabs defaultValue="opportunities" className="space-y-4">
            <TabsList className="grid w-full h-fit grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="opportunities">
                Oportunidades Recentes
              </TabsTrigger>
              <TabsTrigger value="analysis">Análises Recentes</TabsTrigger>
              <TabsTrigger value="proposals">Propostas Recentes</TabsTrigger>
            </TabsList>
            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades Encontradas</CardTitle>
                  <CardDescription>
                    Últimas licitações identificadas pelo radar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenderFavorited.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma oportunidade favoritada
                      </p>
                    )}
                    {tenderFavorited.map((opportunity) => (
                      <Link
                        key={opportunity.id}
                        href={`/opportunities/${opportunity.id}`}
                      >
                        <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">
                              {opportunity.orgaoEntidade.companyName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {opportunity.purchaseObject}
                            </p>
                          </div>
                          <Badge>
                            {opportunity.estimatedTotalValue.toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" }
                            )}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análises em Andamento</CardTitle>
                  <CardDescription>
                    Editais em processo de análise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenderFavorited.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum edital em análise
                      </p>
                    )}
                    {/* tenderFavorited.map((tender) => (
                      <Link
                        key={tender.id}
                        href={`/opportunities/${tender.id}`}
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">
                              {tender.orgaoEntidade.companyName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {tender.purchaseObject}
                            </p>
                          </div>
                          <Badge variant="secondary">Em Análise</Badge>
                        </div>
                      </Link>
                    )) */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="proposals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Propostas em Elaboração</CardTitle>
                  <CardDescription>
                    Últimas propostas trabalhadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">
                            Proposta Técnica - DNIT
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Última atualização há 2 horas
                          </p>
                        </div>
                        <Badge variant="outline">Rascunho</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
