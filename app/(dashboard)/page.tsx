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
import {
  Bell,
  Building2,
  FileSearch,
  FileText,
  LayoutDashboard,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
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
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 novas desde ontem
                </p>
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
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  2 pendentes de revisão
                </p>
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
              <ul className="mt-2 space-y-2">
                <li className="flex items-center justify-between">
                  <span>
                    Pregão Eletrônico 123/2024 - Prefeitura de São Paulo
                  </span>
                  <Badge variant="destructive">Vence em 2 dias</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Concorrência 45/2024 - DNIT</span>
                  <Badge>Vence em 5 dias</Badge>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Recent Activities */}
          <Tabs defaultValue="opportunities" className="space-y-4">
            <TabsList>
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
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">
                            Aquisição de Equipamentos de TI
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Prefeitura Municipal de São Paulo
                          </p>
                        </div>
                        <Badge>R$ 1.5M</Badge>
                      </div>
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
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">Edital PE 123/2024</h3>
                          <p className="text-sm text-muted-foreground">
                            15 documentos pendentes
                          </p>
                        </div>
                        <Badge variant="secondary">Em Análise</Badge>
                      </div>
                    ))}
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
