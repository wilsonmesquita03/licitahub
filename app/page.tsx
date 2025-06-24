import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const opportunities = await prisma.tender.count({
    where: {
      proposalClosingDate: {
        gte: new Date(),
      },
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center bg-background">
      <section className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bem-vindo à nossa plataforma!
        </h1>
        {session?.user ? (
          <p className="text-muted-foreground text-lg">
            Seja bem-vindo, {session.user.name}!
          </p>
        ) : (
          <p className="text-muted-foreground text-lg">
            Acesse sua conta ou cadastre-se para começar a usar nossos recursos
            exclusivos.
          </p>
        )}
        <div className="flex justify-center gap-4">
          {session?.user ? (
            <Link href="/dashboard">
              <Button variant="default" size="lg">
                Ir para o dashboard
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
        <p className="left-1/2 -translate-x-1/2 absolute bottom-4 text-xs text-muted-foreground">
          {opportunities} Oportunidades esperando por você
        </p>
      </section>
    </main>
  );
}
