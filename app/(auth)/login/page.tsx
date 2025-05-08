"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { signin } from "../actions";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signin, null);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Acesse sua conta</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="seu@email.com" />
            {state?.error?.email && (
              <span className="text-red-500">{state.error.email}</span>
            )}
          </div>

          <div>
            <Label>Senha</Label>
            <Input name="password" type="password" placeholder="••••••••" />
            {state?.error?.password && (
              <span className="text-red-500">{state.error.password}</span>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="animate-spin" /> : "Entrar"}
          </Button>

          {state?.error?.global && (
            <span className="text-red-500">{state.error.global}</span>
          )}
        </form>

        <div className="text-center text-sm">
          Não tem conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </div>
      </Card>
    </div>
  );
}
