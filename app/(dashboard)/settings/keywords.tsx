"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateKeywords } from "./actions";

interface IKeywordsProps {
  id: string | null;
  keywords: string[];
}

export default function Keywords({ id, keywords }: IKeywordsProps) {
  const [keywordsState, setKeywordsState] = useState<string[]>(keywords);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeyword.trim();
    if (trimmed && !keywordsState.includes(trimmed)) {
      setKeywordsState((prev) => [...prev, trimmed]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywordsState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveKeywords = async () => {
    setIsSaving(true);
    try {
      await updateKeywords(id, keywordsState);
    } catch (err) {
      toast.error("Erro ao salvar palavras-chave.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Palavras-chave para buscas</CardTitle>
        <CardDescription>
          Adicione palavras-chave que serão utilizadas como filtros nas
          consultas de licitações.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <>
          <div className="flex flex-wrap gap-2">
            {keywordsState?.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center"
              >
                {keyword}
                <button
                  className="ml-1"
                  onClick={() => removeKeyword(index)}
                  aria-label="Remover"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          <form onSubmit={handleAddKeyword} className="flex items-center gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Nova palavra-chave"
            />
            <Button type="submit" variant="secondary">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </form>
        </>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSaveKeywords} disabled={isSaving}>
          {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          Salvar palavras-chave
        </Button>
      </CardFooter>
    </Card>
  );
}
