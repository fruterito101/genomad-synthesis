"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { useTranslation } from "react-i18next"
import { NotificationBell } from "@/components/NotificationBell"
import {
  LayoutDashboard,
  Dna,
  Users,
  TrendingUp,
  User,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    titleEs: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Agents",
    titleEs: "Mis Agentes",
    url: "/profile",
    icon: Dna,
  },
  {
    title: "Breeding",
    titleEs: "Breeding",
    url: "/breeding",
    icon: Users,
  },
  {
    title: "Leaderboard",
    titleEs: "Ranking",
    url: "/agents",
    icon: Trophy,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { i18n } = useTranslation()
  const { logout, user } = usePrivy()
  const isEs = i18n.language === "es"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Dna className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Genomad</span>
                  <span className="text-xs text-muted-foreground">AI Evolution</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isEs ? "Plataforma" : "Platform"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{isEs ? item.titleEs : item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <>
              <SidebarMenuItem className="flex justify-center py-2">
                <NotificationBell />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/profile">
                    <User className="size-4" />
                    <span className="truncate">
                      {user.wallet?.address
                        ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                        : isEs ? "Mi Cuenta" : "My Account"}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => logout()}>
                  <LogOut className="size-4" />
                  <span>{isEs ? "Salir" : "Logout"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
