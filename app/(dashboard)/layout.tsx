import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "LicitaHub - Gestão Inteligente de Licitações",
  description:
    "Plataforma completa para gestão de participação em licitações públicas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <>
      <Header />
      <SidebarProvider>
        <AppSidebar />
        <main className="min-h-[calc(100dvh-64px)] w-full">
          <div className="flex z-10 py-1.5 items-center px-2 md:px-2 gap-2">
            <SidebarTrigger
              variant="outline"
              className="w-[34px] h-[34px] p-2"
            />
          </div>
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
