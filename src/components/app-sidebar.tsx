"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import {
  LayoutDashboard,
  Dna,
  Users,
  Trophy,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Agents", url: "/profile", icon: User },
  { title: "Breeding", url: "/breeding", icon: Users },
  { title: "Leaderboard", url: "/agents", icon: Trophy },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, user } = usePrivy();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-card border-r border-border
        flex flex-col transition-all duration-300 z-40
        ${collapsed ? "w-16" : "w-56"}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Dna className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Genomad</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Dna className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Wallet */}
        {user?.wallet?.address && !collapsed && (
          <div className="px-3 py-2 text-xs text-muted-foreground font-mono truncate">
            {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
          </div>
        )}
        
        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// Simple wrapper to replace SidebarProvider pattern
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-56 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

export default AppSidebar;
