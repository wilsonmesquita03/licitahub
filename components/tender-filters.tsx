'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface TenderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedOrgan: string;
  onOrganChange: (value: string) => void;
  statusOptions: string[];
  organOptions: string[];
}

export function TenderFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedOrgan,
  onOrganChange,
  statusOptions,
  organOptions,
}: TenderFiltersProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Radar de Oportunidades</h1>

        <div className="w-full md:w-auto">
          <Input
            placeholder="Buscar por título ou entidade..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entidade</Label>
            <Select value={selectedOrgan} onValueChange={onOrganChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o órgão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Entidades</SelectItem>
                {organOptions.map((organ) => (
                  <SelectItem key={organ} value={organ}>
                    {organ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Mais recentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="deadline">Prazo mais curto</SelectItem>
                <SelectItem value="value">Maior valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </>
  );
}
