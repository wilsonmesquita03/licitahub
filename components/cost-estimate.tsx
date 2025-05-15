"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Info, Percent, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tender } from "@prisma/client";
import { CostItem } from "@/types/tender";
import { Badge } from "./ui/badge";
import { getCosts } from "@/app/actions";
import { addCostAction } from "@/app/(dashboard)/opportunities/actions";
import useSWR from "swr";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

interface CostEstimateProps {
  tender: Tender;
}

export function CostEstimate({ tender }: CostEstimateProps) {
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCost, setNewCost] = useState({
    description: "",
    category: "materiais",
    value: 0,
  });
  const [safetyMargin, setSafetyMargin] = useState<number>(10);

  useSWR(
    `/api/tender/${tender.id}/costs`,
    async () => {
      const response = await fetch(`/api/tender/${tender.id}/costs`);
      return response.json();
    },
    {
      onSuccess: (data) => {
        setCosts(data);
      },
    }
  );

  const categories = [
    { value: "MATERIAL", label: "Materiais" },
    { value: "SERVICO", label: "Serviços" },
    { value: "TRANSPORTE", label: "Transporte" },
    { value: "TRIBUTOS", label: "Tributos" },
    { value: "OUTROS", label: "Outros" },
  ];

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await getCosts(file); // chama a IA
      if (result?.costs?.length) {
      }
    } catch (err) {
      console.error("Erro ao extrair custos:", err);
    } finally {
      event.target.value = ""; // permite reselecionar o mesmo arquivo depois
    }
  };

  const addCost = async () => {
    if (newCost.description && newCost.value > 0) {
      const costToAdd: {
        type: "FIXED" | "VARIABLE";
        category: "MATERIAL" | "SERVICO" | "TRANSPORTE" | "TRIBUTOS" | "OUTROS";
        description: string;
        value: number;
      } = {
        ...newCost,
        type: "FIXED",
        category: "SERVICO",
      };

      const response = await addCostAction(tender.id, costToAdd);

      setCosts([
        ...costs,
        {
          id: response.id,
          type: response.type,
          description: response.description,
          category: response.category,
          value: response.value,
        },
      ]);
      setNewCost({ description: "", category: "materiais", value: 0 });
      setShowAddForm(false);
    }
  };

  const removeCost = (id: string) => {
    setCosts(costs.filter((cost) => cost.id !== id));
  };

  const totalEstimated = costs.reduce((sum, cost) => sum + cost.value, 0);
  const totalWithSafety = totalEstimated * (1 + safetyMargin / 100);

  // Cálculo do lance mínimo viável
  const minViableBid = totalWithSafety;

  const possibleProfit = tender.estimatedTotalValue - totalWithSafety;
  const competitivenessMargin =
    ((tender.estimatedTotalValue - minViableBid) / tender.estimatedTotalValue) *
    100;

  return (
    <Card className="p-6 space-y-6 lg:col-span-3">
      {/* Cabeçalho e Botão de Adição */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestão de Custos</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button
              type="button"
              className="bg-green-300 relative overflow-hidden"
            >
              IA
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </Button>
          </label>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Custo
          </Button>
        </div>
      </div>

      {/* Formulário de Adição (se visível) */}
      {showAddForm && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newCost.description}
                onChange={(e) =>
                  setNewCost({ ...newCost, description: e.target.value })
                }
                placeholder="Descrição do custo"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newCost.category}
                onValueChange={(value) =>
                  setNewCost({ ...newCost, category: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={newCost.value}
                onChange={(e) =>
                  setNewCost({ ...newCost, value: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
            <Button onClick={addCost}>Adicionar</Button>
          </div>
        </Card>
      )}

      {/* Lista de Custos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custos Estimados</h3>
        {costs.length > 0 ? (
          <div className="space-y-2">
            {costs.map((cost) => (
              <Card key={cost.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cost.description}</span>
                      <Badge variant="outline">
                        {
                          categories.find((c) => c.value === cost.category)
                            ?.label
                        }
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(cost.value)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCost(cost.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Nenhum custo adicionado ainda
          </Card>
        )}
      </div>

      {/* Configurações e Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Margem de Segurança */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Label>Margem de Segurança</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Margem adicional para imprevistos (recomendado 10-20%)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={safetyMargin}
              onChange={(e) => setSafetyMargin(Number(e.target.value))}
              className="w-24"
            />
            <span>%</span>
          </div>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="p-4 md:col-span-2 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Custo Total:</p>
              <p className="font-medium">{formatCurrency(totalEstimated)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Custo com Segurança:
              </p>
              <p className="font-medium">{formatCurrency(totalWithSafety)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Valor do Órgão:</p>
              <p className="font-medium">
                {formatCurrency(tender.estimatedTotalValue)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lucro Estimado:</p>
              <p
                className={`font-medium ${
                  possibleProfit > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(possibleProfit)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resultado Final */}
      <Card className="p-4 bg-primary/5 border-primary">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Lance Mínimo Viável</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(minViableBid)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Análise Competitiva</p>
            <div className="flex items-center gap-4">
              <p
                className={`font-medium ${
                  competitivenessMargin > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {competitivenessMargin.toFixed(1)}% de margem
              </p>
              <Badge
                variant={competitivenessMargin > 0 ? "default" : "destructive"}
              >
                {competitivenessMargin > 0 ? "Competitivo" : "Inválido"}
              </Badge>
            </div>
          </div>
        </div>

        {competitivenessMargin > 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Você pode reduzir seu lance em até{" "}
            <span className="font-medium text-green-600">
              {formatCurrency(tender.estimatedTotalValue - minViableBid)}
            </span>{" "}
            e ainda ser lucrativo
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Seu custo mínimo já está acima do valor estimado!
          </p>
        )}
      </Card>
    </Card>
  );
}
