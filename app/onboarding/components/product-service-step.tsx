// app/onboarding/components/product-service-step.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../onboarding-provider";

export function ProductServiceStep() {
  const { formData, updateFormData } = useOnboarding();

  const categories = [
    { value: "agropecuaria", label: "Agropecuária" },
    { value: "alimenticio", label: "Alimentício" },
    { value: "automotivo", label: "Automotivo" },
    { value: "beleza-estetica", label: "Beleza e Estética" },
    { value: "comercio", label: "Comércio" },
    { value: "comunicacao", label: "Comunicação" },
    { value: "construcao", label: "Construção Civil" },
    { value: "consultoria", label: "Consultoria" },
    { value: "cultural", label: "Cultura e Entretenimento" },
    { value: "design-multimidia", label: "Design e Multimídia" },
    { value: "educacao", label: "Educação" },
    { value: "eletrico", label: "Elétrico e Eletrônico" },
    { value: "energia", label: "Energia e Utilidades" },
    { value: "engenharia", label: "Engenharia" },
    { value: "esportes", label: "Esportes e Lazer" },
    { value: "eventos", label: "Eventos" },
    { value: "financeiro", label: "Serviços Financeiros" },
    { value: "gastronomia", label: "Gastronomia" },
    { value: "imobiliario", label: "Imobiliário" },
    { value: "industria", label: "Indústria" },
    { value: "juridico", label: "Jurídico" },
    { value: "limpeza", label: "Limpeza e Conservação" },
    { value: "logistica", label: "Logística e Transporte" },
    { value: "manutencao", label: "Manutenção e Reparos" },
    { value: "marketing", label: "Marketing e Publicidade" },
    { value: "meio-ambiente", label: "Meio Ambiente" },
    { value: "moda", label: "Moda e Vestuário" },
    { value: "pet", label: "Serviços para Pets" },
    { value: "publicidade", label: "Publicidade e Mídia" },
    { value: "quimico", label: "Químico e Farmacêutico" },
    { value: "recreacao", label: "Recreação e Lazer" },
    { value: "reparos", label: "Reparos Domésticos" },
    { value: "saude", label: "Saúde e Bem-Estar" },
    { value: "seguranca", label: "Segurança" },
    { value: "servicos-domesticos", label: "Serviços Domésticos" },
    { value: "servicos-publicos", label: "Serviços Públicos" },
    { value: "tecnologia", label: "Tecnologia da Informação" },
    { value: "telecomunicacoes", label: "Telecomunicações" },
    { value: "terceirizacao", label: "Terceirização de Serviços" },
    { value: "transporte", label: "Transporte" },
    { value: "turismo", label: "Turismo e Hotelaria" },
    { value: "outros", label: "Outros" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="productServiceDescription">
          Descrição dos Produtos/Serviços
        </Label>
        <Textarea
          id="productServiceDescription"
          value={formData.productServiceDescription}
          onChange={(e) =>
            updateFormData({ productServiceDescription: e.target.value })
          }
          placeholder="Descreva com detalhes o que sua empresa oferece"
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label>Categoria Principal</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria principal" />
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

      <div>
        <Label htmlFor="yearsInOperation">Anos no Mercado</Label>
        <Input
          type="number"
          id="yearsInOperation"
          placeholder="Quantos anos sua empresa está ativa?"
        />
      </div>
    </div>
  );
}
