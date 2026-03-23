"use client";

import { useState, useEffect } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseTestnet, baseMainnet } from "@/lib/blockchain/chains";
import { wagmiConfig } from "@/lib/wagmi/config";
import { I18nProvider } from "@/i18n";
import { NetworkProvider } from "@/contexts/NetworkContext";

const queryClient = new QueryClient();

// Get initial chain from localStorage (client-side only)
function getInitialChain() {
  if (typeof window === "undefined") return baseMainnet;
  const saved = localStorage.getItem("genomad-network");
  return saved === "testnet" ? baseTestnet : baseMainnet;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [currentChain, setCurrentChain] = useState(baseTestnet);
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  useEffect(() => {
    setMounted(true);
    // Set initial chain from localStorage
    setCurrentChain(getInitialChain());
    
    // Listen for network changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "genomad-network") {
        setCurrentChain(e.newValue === "mainnet" ? baseMainnet : baseTestnet);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Always render I18nProvider for translations
  if (!appId) {
    return (
      <I18nProvider>
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">⚠️ Privy not configured</h1>
            <p className="mt-2 text-zinc-400">Add NEXT_PUBLIC_PRIVY_APP_ID to .env.local</p>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // Don't render Privy until client-side mounted
  if (!mounted) {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <NetworkProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <PrivyProvider
              appId={appId}
              config={{
                loginMethods: ["wallet", "email"],
                appearance: {
                  theme: "dark",
                  accentColor: "#7B3FE4",
                  logo: "/logo.png",
                },
                walletConnectors: ["detected_wallets", "metamask", "rainbow", "wallet_connect"],
                embeddedWallets: {
                  ethereum: {
                    createOnLogin: "users-without-wallets",
                  },
                },
                // Soporta AMBAS redes - default es la seleccionada
                defaultChain: currentChain,
                supportedChains: [baseTestnet, baseMainnet],
              }}
            >
              {children}
            </PrivyProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </NetworkProvider>
    </I18nProvider>
  );
}
