"use client";
import {
  ChevronUp,
  FileSearch,
  FileText,
  LayoutDashboard,
  Search,
  User2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useSession } from "@/app/session-provider";
import { usePathname } from "next/navigation";
import { SidebarHistory } from "./chat/sidebar-history";
import { LoginRequiredModal } from "./auth-required";
import { NavUser } from "./nav-user";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    auth: true,
  },
  {
    title: "Analisador de Editais",
    url: "/analyzer",
    icon: FileSearch,
    auth: true,
  },
  {
    title: "Radar de Oportunidades",
    url: "/opportunities",
    icon: Search,
  },
  {
    title: "Montador de Propostas",
    url: "/propostas",
    icon: FileText,
  },
];

export function AppSidebar() {
  const session = useSession();
  const pathname = usePathname();

  return (
    <Sidebar className="mt-[61px] h-[calc(100%-61px)]">
      <SidebarContent className="dark:bg-black">
        <SidebarGroup>
          <SidebarGroupLabel>Menu lateral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.auth && !session.user ? (
                    <LoginRequiredModal>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </LoginRequiredModal>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {pathname.includes("/analyzer") && session?.user && (
          <SidebarGroup>
            <SidebarGroupLabel>Analises anteriores</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarHistory user={session.user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="dark:bg-black">
        {session.user && (
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <NavUser
                  user={{
                    name: session.user.name || "",
                    email: session.user.email,
                    picture: session.user.picture,
                  }}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
        {session.status === "unauthenticated" && (
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/login">
                        <span>Entrar</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
