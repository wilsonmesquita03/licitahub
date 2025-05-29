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

export default function Keywords() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await fetch("/api/user/keywords");
        const data = await res.json();
        setKeywords(data || []);
      } catch (err) {
        console.error("Erro ao carregar palavras-chave:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveKeywords = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
    } catch (err) {
      console.error("Erro ao salvar palavras-chave:", err);
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
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
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

            <form
              onSubmit={handleAddKeyword}
              className="flex items-center gap-2"
            >
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
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleSaveKeywords} disabled={isSaving || isLoading}>
          {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          Salvar palavras-chave
        </Button>
      </CardFooter>
    </Card>
  );
}
