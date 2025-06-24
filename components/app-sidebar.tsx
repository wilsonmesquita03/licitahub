"use client";
import {
  FileSearch,
  FileText,
  LayoutDashboard,
  Loader2,
  Newspaper,
  Search,
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
import { usePathname } from "next/navigation";
import { SidebarHistory } from "./chat/sidebar-history";
import { LoginRequiredModal } from "./auth-required";
import { NavUser } from "./nav-user";
import { authClient } from "@/lib/auth-client";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
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
  {
    title: "Boletim de Licitações",
    url: "/boletim",
    icon: Newspaper,
  },
];

export function AppSidebar() {
  const session = authClient.useSession();
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
                  {item.auth && !session?.data?.user ? (
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
        {pathname.includes("/analyzer") && session?.data?.user && (
          <SidebarGroup>
            <SidebarGroupLabel>Analises anteriores</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarHistory user={session?.data.user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="dark:bg-black">
        {session?.data?.user && (
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <NavUser
                  user={{
                    name: session.data?.user.name || "",
                    email: session.data?.user.email,
                    picture: session.data?.user.image || null,
                  }}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
        {session.isPending && (
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Loader2 className="animate-spin" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
        {!session.data?.user && !session.isPending && (
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
