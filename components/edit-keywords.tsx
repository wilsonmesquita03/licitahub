"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { updateKeyowrds } from "@/app/(dashboard)/boletim/actions";

interface EditKeywordsModalProps {
  boletimId: string;
  initialKeywords: string[];
}

export function EditKeywordsModal({
  boletimId,
  initialKeywords,
}: EditKeywordsModalProps) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addKeyword() {
    const trimmed = input.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
    }
    setInput("");
  }

  function removeKeyword(keyword: string) {
    setKeywords(keywords.filter((k) => k !== keyword));
  }

  function saveKeywords() {
    startTransition(async () => {
      const res = await updateKeyowrds(boletimId, keywords);

      if (res.ok) {
        toast.success(
          "Palavras-chave atualizadas! Atualize a página para ver as alterações."
        );
        setOpen(false);
      } else {
        toast.error("Erro ao salvar palavras-chave.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Editar palavras-chave</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar palavras-chave</DialogTitle>
          <DialogDescription>
            Adicione ou remova as palavras-chave associadas ao boletim.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Badge key={kw} variant="outline">
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Nova palavra-chave"
            />
            <Button onClick={addKeyword}>Adicionar</Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={saveKeywords} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
