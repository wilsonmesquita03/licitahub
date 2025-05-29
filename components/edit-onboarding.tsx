// app/settings/_components/edit-response-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function EditResponseDialog({
  id,
  initialAnswer,
  question,
}: {
  id: string;
  initialAnswer: string;
  question: string;
}) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(initialAnswer);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await fetch(`/api/onboarding-response/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      if (res.ok) {
        toast.success("Resposta atualizada!");
        setOpen(false);
      } else {
        toast.error("Erro ao atualizar resposta");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar resposta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm font-medium">{question}</p>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isPending}
          />
          <Button onClick={handleSubmit} disabled={isPending}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
