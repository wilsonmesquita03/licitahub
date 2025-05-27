"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { signup } from "../actions";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Criar nova conta</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input name="name" placeholder="Seu nome completo" />
          </div>

          <div>
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="seu@email.com" />
          </div>

          <div>
            <Label>Senha</Label>
            <Input name="password" type="password" placeholder="••••••••" />
          </div>

          <div>
            <Label>Confirme a Senha</Label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : "Criar conta"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </Card>
    </div>
  );
}
