// components/operation-step.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../onboarding-provider";
import { Label } from "@/components/ui/label";

export function OperationStep() {
  const { formData, updateFormData } = useOnboarding();

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de Operação</Label>
        <Select value={formData.operationType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de operação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="hibrido">Híbrido</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
