// components/tender-filters.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import TagInput from "./tag-input";

export function TenderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uf, setUf] = useState(searchParams.get("uf") || "");
  const [query, setQuery] = useState<string[]>(
    searchParams.get("q")?.split(",") || []
  );
  const [disputeModeName, setDisputeModeName] = useState(
    searchParams.get("disputeModeName") || ""
  );
  const [modalityName, setModalityName] = useState(
    searchParams.get("modalityName") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (uf) params.set("uf", uf);
    else params.delete("uf");
    if (query) params.set("q", query.join(","));
    else params.delete("q");
    if (disputeModeName) params.set("disputeModeName", disputeModeName);
    else params.delete("disputeModeName");
    if (modalityName) params.set("modalityName", modalityName);
    else params.delete("modalityName");

    params.set("page", "1"); // resetar paginação

    router.push(`?${params.toString()}`);
  };

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  const disputeModes = [
    "Aberto",
    "Fechado",
    "Aberto-Fechado",
    "Dispensa Com Disputa",
    "Não se aplica",
    "Fechado-Aberto",
  ];
  const modalities = [
    "Leilão - Eletrônico",
    "Diálogo Competitivo",
    "Concurso",
    "Concorrência - Eletrônica",
    "Concorrência - Presencial",
    "Pregão - Eletrônico",
    "Pregão - Presencial",
    "Dispensa de Licitação",
    "Inexigibilidade",
    "Manifestação de Interesse",
    "Pré-qualificação",
    "Credenciamento",
    "Leilão - Presencial",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 items-end"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Filtrar</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Buscar</label>
            <TagInput onChange={(q) => setQuery(q)} />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">UF</label>
            <Select onValueChange={setUf} value={uf}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Selecionar UF" />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Modalidade</label>
            <Select onValueChange={setModalityName} value={modalityName}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalities.map((mod) => (
                  <SelectItem key={mod} value={mod}>
                    {mod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Modo de Disputa</label>
            <Select onValueChange={setDisputeModeName} value={disputeModeName}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar modo de disputa" />
              </SelectTrigger>
              <SelectContent>
                {disputeModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit">Filtrar</Button>

          <Button
            type="reset"
            variant="outline"
            onClick={() => {
              setUf("");
              setModalityName("");
              setDisputeModeName("");
            }}
          >
            Limpar filtros
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
