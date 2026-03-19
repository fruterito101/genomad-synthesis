// src/components/AppHeader.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useGMDBalance } from "@/hooks/useGMDBalance";
import { 
  Dna, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Wallet,
  Coins,
  RefreshCw
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Breeding", href: "/breeding", icon: Dna },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, authenticated } = usePrivy();
  const { formatted: gmdBalance, isLoading: gmdLoading, refetch: refetchGMD } = useGMDBalance();

  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : "";

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ borderBottom: "1px solid var(--color-border)" }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dna className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            <span className="text-xl font-bold">
              <span className="gradient-text">Geno</span>
              <span style={{ color: "var(--color-text-primary)" }}>mad</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                    backgroundColor: isActive ? "rgba(123, 63, 228, 0.1)" : "transparent",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-0.5"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      layoutId="activeNav"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          {authenticated && (
            <div className="flex items-center gap-3">
              {/* GMD Balance */}
              <motion.button
                onClick={() => refetchGMD()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Click to refresh"
              >
                <Coins className="w-4 h-4 text-yellow-400" />
                {gmdLoading ? (
                  <RefreshCw className="w-4 h-4 text-yellow-300 animate-spin" />
                ) : (
                  <span className="font-mono font-bold text-yellow-300">{gmdBalance}</span>
                )}
                <span className="text-yellow-400/70 text-xs">GMD</span>
              </motion.button>

              {/* Wallet */}
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Wallet className="w-4 h-4" style={{ color: "var(--color-success)" }} />
                <code className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {shortWallet}
                </code>
              </div>

              {/* Logout */}
              <motion.button
                onClick={logout}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--color-error)" }}
                whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default AppHeader;
