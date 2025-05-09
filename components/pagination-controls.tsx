"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  limit: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  limit,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (page: number, newLimit: number = limit) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("limit", newLimit.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      {/* Seletor de Limite */}
      <div className="w-[200px]">
        <Select
          defaultValue={limit.toString()}
          onValueChange={(value) => updateParams(1, Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Licitações por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
            <SelectItem value="100">100 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Controles de Página */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => updateParams(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          variant="outline"
          onClick={() => updateParams(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
