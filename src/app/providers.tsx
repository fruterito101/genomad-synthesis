"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { monadTestnet } from "viem/chains";
import { wagmiConfig } from "@/lib/wagmi/config";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">⚠️ Privy not configured</h1>
          <p className="mt-2 text-zinc-400">Add NEXT_PUBLIC_PRIVY_APP_ID to .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={appId}
          config={{
            loginMethods: ["telegram", "wallet", "email"],
            appearance: {
              theme: "dark",
              accentColor: "#10B981",
              logo: "/logo.png",
            },
            embeddedWallets: {
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            },
            defaultChain: monadTestnet,
            supportedChains: [monadTestnet],
          }}
        >
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
