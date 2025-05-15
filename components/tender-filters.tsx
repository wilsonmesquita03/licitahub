// components/tender-filters.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { addDays, subDays, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function TenderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();
  const yesterday = subDays(today, 1);
  const maxDate = addDays(yesterday, 8);

  const minDateStr = format(yesterday, "yyyy-MM-dd");
  const maxDateStr = format(maxDate, "yyyy-MM-dd");

  const [uf, setUf] = useState(searchParams.get("uf") || "");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
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
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");
    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");
    if (query) params.set("q", query);
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
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Buscar</label>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Data de Publicação (de)
            </label>
            <Input
              type="date"
              value={startDate}
              min={minDateStr}
              max={maxDateStr}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Data de Publicação (até)
            </label>
            <Input
              type="date"
              value={endDate}
              min={minDateStr}
              max={maxDateStr}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button type="submit">Filtrar</Button>

          <Button
            type="reset"
            variant="outline"
            onClick={() => {
              setQuery("");
              setUf("");
              setModalityName("");
              setDisputeModeName("");
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar filtros
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
