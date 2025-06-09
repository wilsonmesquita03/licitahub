import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "LicitaHub - Gestão Inteligente de Licitações",
  description:
    "Plataforma completa para gestão de participação em licitações públicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <SidebarProvider>
        <AppSidebar />
        <main className="min-h-[calc(100dvh-64px)] w-full">
          <div className="flex fixed z-10 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
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
