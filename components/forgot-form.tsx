"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";

// Validação com Zod
const forgotSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: ForgotFormValues) => {
    setIsPending(true);

    try {
      const { data, error } = await authClient.forgetPassword({
        email: email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error("Erro ao solicitar recuperação", {
          description: error.message || "Não foi possível enviar o e-mail.",
        });
      } else {
        toast.success("E-mail enviado", {
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
      }
    } catch {
      toast.error("Erro inesperado", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
          <p className="text-muted-foreground text-sm">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar e-mail de recuperação"
          )}
        </Button>

        <div className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Voltar para o login
          </Link>
        </div>
      </form>
    </Form>
  );
}
