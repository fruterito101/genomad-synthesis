"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { monadTestnet } from "@/lib/blockchain/chains";
import { wagmiConfig } from "@/lib/wagmi/config";
import { I18nProvider } from "@/i18n";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

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

  return (
    <I18nProvider>
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
    </I18nProvider>
  );
}
