// src/components/AppHeader.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
  RefreshCw,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const walletAddress = user?.wallet?.address;
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` 
    : "";

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ borderBottom: "1px solid var(--color-border)" }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Genomad" 
              width={140} 
              height={40} 
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                    backgroundColor: isActive ? "rgba(123, 63, 228, 0.1)" : "transparent",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side */}
          {authenticated && (
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* GMD Balance */}
              <motion.button
                onClick={() => refetchGMD()}
                className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Coins className="w-4 h-4 text-yellow-400" />
                {gmdLoading ? (
                  <RefreshCw className="w-3 h-3 text-yellow-300 animate-spin" />
                ) : (
                  <span className="font-mono font-bold text-yellow-300 text-sm">{gmdBalance}</span>
                )}
                <span className="text-yellow-400/70 text-xs hidden lg:inline">GMD</span>
              </motion.button>

              {/* Wallet */}
              <div 
                className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Wallet className="w-3 h-3 lg:w-4 lg:h-4" style={{ color: "var(--color-success)" }} />
                <code className="text-xs lg:text-sm" style={{ color: "var(--color-text-secondary)" }}>
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
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--color-text-primary)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden glass"
            style={{ borderTop: "1px solid var(--color-border)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                      backgroundColor: isActive ? "rgba(123, 63, 228, 0.1)" : "transparent",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {authenticated && (
                <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span style={{ color: "var(--color-text-secondary)" }}>Balance:</span>
                      <span className="font-mono font-bold text-yellow-300">{gmdBalance} GMD</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" style={{ color: "var(--color-success)" }} />
                      <code className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "var(--color-error)",
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default AppHeader;
