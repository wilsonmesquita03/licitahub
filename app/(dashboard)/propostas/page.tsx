"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Copy, FileDown, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProposalForm {
  razaoSocial: string;
  cnpj: string;
  responsavel: string;
  objeto: string;
  valor: string;
  observacoes: string;
  conteudoEdital: string;
}

export default function PropostasPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProposalForm>();

  const onSubmit = async (data: ProposalForm) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/montarProposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao gerar proposta');
      }

      const result = await response.json();
      setProposal(result.proposal);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a proposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (proposal) {
      await navigator.clipboard.writeText(proposal);
      toast({
        title: "Copiado!",
        description: "Texto da proposta copiado para a área de transferência",
      });
    }
  };

  const handleExportPDF = () => {
    if (proposal) {
      const element = document.createElement('a');
      const file = new Blob([proposal], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = 'proposta.pdf';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleReset = () => {
    reset();
    setProposal(null);
  };

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Montador de Propostas</h1>
          <p className="text-muted-foreground">
            Gere propostas técnicas e comerciais para licitações
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Proposta</CardTitle>
              <CardDescription>
                Preencha as informações para gerar sua proposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    {...register("razaoSocial", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    {...register("cnpj", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    {...register("responsavel", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objeto">Objeto da Proposta</Label>
                  <Textarea
                    id="objeto"
                    {...register("objeto", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Total Estimado (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    {...register("valor", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    {...register("observacoes")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conteudoEdital">Conteúdo do Edital (opcional)</Label>
                  <Textarea
                    id="conteudoEdital"
                    {...register("conteudoEdital")}
                    maxLength={2000}
                    className="h-32"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isGenerating}
                  >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar Proposta
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Prévia da Proposta */}
          <Card>
            <CardHeader>
              <CardTitle>Prévia da Proposta</CardTitle>
              <CardDescription>
                Visualize e exporte o texto gerado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : proposal ? (
                <>
                  <div className="prose prose-sm max-w-none mb-4 max-h-[500px] overflow-y-auto p-4 border rounded-lg">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{proposal}</div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                    <Button onClick={handleExportPDF}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onSubmit(handleSubmit((data) => data)())}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Gerar Nova Versão
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Preencha o formulário e clique em "Gerar Proposta"
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}