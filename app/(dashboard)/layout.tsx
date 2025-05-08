import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Header />
      <SidebarProvider>
        <AppSidebar />
        <main className="min-h-screen w-full">
          <div className="container p-4">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
