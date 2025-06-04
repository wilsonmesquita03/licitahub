"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center bg-background">
      <section className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bem-vindo à nossa plataforma!
        </h1>
        <p className="text-muted-foreground text-lg">
          Acesse sua conta ou cadastre-se para começar a usar nossos recursos
          exclusivos.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button variant="default" size="lg">
              Fazer login
            </Button>
          </Link>

          <Link href="/register">
            <Button variant="outline" size="lg">
              Criar conta
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
