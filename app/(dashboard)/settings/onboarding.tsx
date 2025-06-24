"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OnboardingResponse } from "@/prisma/generated/prisma";
import { EditInput } from "./edit-input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { updateResponses } from "./actions";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ptBR = {
  category: "Categoria",
  companyName: "Nome da Empresa",
  cnpj: "CNPJ",
  employeesCount: "Quantidade de Funcionários",
  operationType: "Tipo de Operação",
  productServiceDescription: "Descrição de Produtos/Serviços",
  annualRevenue: "Receita Anual",
};

export const Onboarding = ({
  responses,
}: {
  responses: OnboardingResponse[];
}) => {
  const defaultValues = Object.fromEntries(
    responses.map((response) => [response.inputName, response.answer])
  );

  const [originalValuesState, setOriginalValuesState] = useState(defaultValues);

  const { register, handleSubmit, watch } = useForm({
    defaultValues,
  });

  const onSubmit = async (data: Record<string, string>) => {
    const modified: Record<string, string> = {};

    for (const key in data) {
      if (data[key] !== originalValuesState[key]) {
        modified[key] = data[key];
      }
    }

    if (Object.keys(modified).length > 0) {
      const response = await updateResponses(modified);

      setOriginalValuesState({ ...originalValuesState, ...response });

      toast.success("Configuracoes atualizadas com sucesso!");
    } else {
      toast.info("Nenhuma configuração foi alterada.");
    }
  };

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle className="text-xl">Configurações do Assistente</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Ver minhas respostas</Button>
          </DialogTrigger>
          <form>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Minhas respostas</DialogTitle>
                <DialogDescription>
                  Aqui voce pode ver suas respostas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {responses.map((response) => (
                  <div className="space-y-2" key={response.id}>
                    <Label id={response.inputName}>
                      {ptBR[response.question as keyof typeof ptBR] ||
                        response.question}
                    </Label>
                    <EditInput {...register(response.inputName)} />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSubmit(onSubmit)}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};
