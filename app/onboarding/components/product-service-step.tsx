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
            <SelectItem value="tecnologia">Tecnologia</SelectItem>
            <SelectItem value="construcao">Construção Civil</SelectItem>
            <SelectItem value="consultoria">Consultoria</SelectItem>
            <SelectItem value="alimenticio">Alimentício</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
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
