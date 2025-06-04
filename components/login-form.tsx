"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Loader2 } from "lucide-react";

interface SignIn {
  email: string;
  password: string;
}

const callbackURL = "/dashboard";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignIn>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInGoogle = async () => {
    setIsPending(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (err) {
      toast({
        title: "Erro ao fazer login com o Google.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const onSubmit = async (data: SignIn) => {
    setIsPending(true);
    try {
      const { error } = await authClient.signIn.email({
        ...data,
        callbackURL,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message || "Verifique suas credenciais.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
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
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <div className="grid gap-6">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{ required: "O e-mail é obrigatório" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            rules={{ required: "A senha é obrigatória" }}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botão de login */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={signInGoogle}
            type="button"
            disabled={isPending}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.7 1.22 9.2 3.22l6.84-6.84C35.88 2.1 30.3 0 24 0 14.64 0 6.6 5.64 2.68 13.84l7.96 6.2C12.6 13.3 17.9 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.64-.14-3.22-.4-4.74H24v9h12.7c-.54 2.9-2.2 5.36-4.7 7.04l7.3 5.68C43.1 37.08 46.5 31.08 46.5 24z"
              />
              <path
                fill="#FBBC05"
                d="M10.64 28.04a14.5 14.5 0 0 1 0-8.08l-7.96-6.2a24 24 0 0 0 0 20.48l7.96-6.2z"
              />
              <path
                fill="#34A853"
                d="M24 46.5c6.3 0 11.88-2.1 16.04-5.7l-7.3-5.68c-2.2 1.48-5 2.38-8.74 2.38-6.1 0-11.4-3.8-13.36-9.14l-7.96 6.2C6.6 42.36 14.64 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          </Button>
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
