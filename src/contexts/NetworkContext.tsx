"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { baseTestnet, baseMainnet } from "@/lib/blockchain/chains";
import { CONTRACTS } from "@/lib/blockchain/contracts.config";
import { createPublicClient, http, PublicClient } from "viem";

export type Network = "testnet" | "mainnet";

interface NetworkContextType {
  network: Network;
  switchNetwork: (network: Network) => void;
  chain: typeof baseTestnet;
  contracts: {
    genomadNFT: string;
    breedingFactory: string;
    gmdToken: string;
  };
  rpcUrl: string;
  publicClient: PublicClient;
  isMainnet: boolean;
  isTestnet: boolean;
  explorerUrl: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// RPC URLs
const RPC_URLS = {
  testnet: process.env.NEXT_PUBLIC_TESTNET_RPC || "https://sepolia.base.org",
  mainnet: process.env.NEXT_PUBLIC_MAINNET_RPC || "https://mainnet.base.org",
};

// Explorer URLs
const EXPLORER_URLS = {
  testnet: "https://sepolia.basescan.org",
  mainnet: "https://basescan.org",
};

// Default SSR-safe client (testnet)
const defaultPublicClient = createPublicClient({
  chain: baseTestnet,
  transport: http(RPC_URLS.testnet),
});

// Default values for SSR
const defaultNetworkValue: NetworkContextType = {
  network: "testnet",
  switchNetwork: () => {},
  chain: baseTestnet,
  contracts: CONTRACTS.testnet,
  rpcUrl: RPC_URLS.testnet,
  publicClient: defaultPublicClient,
  isMainnet: false,
  isTestnet: true,
  explorerUrl: EXPLORER_URLS.testnet,
};

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>("testnet");
  const [publicClient, setPublicClient] = useState<PublicClient>(() => 
    createPublicClient({
      chain: baseTestnet,
      transport: http(RPC_URLS.testnet),
    })
  );

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("genomad-network") as Network;
      if (saved === "testnet" || saved === "mainnet") {
        setNetworkState(saved);
        // Update public client
        const chain = saved === "mainnet" ? baseMainnet : baseTestnet;
        setPublicClient(
          createPublicClient({
            chain,
            transport: http(RPC_URLS[saved]),
          })
        );
      }
    }
  }, []);

  const switchNetwork = useCallback((newNetwork: Network) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("genomad-network", newNetwork);
    }
    setNetworkState(newNetwork);
    
    // Update public client
    const chain = newNetwork === "mainnet" ? baseMainnet : baseTestnet;
    setPublicClient(
      createPublicClient({
        chain,
        transport: http(RPC_URLS[newNetwork]),
      })
    );
  }, []);

  const chain = network === "mainnet" ? baseMainnet : baseTestnet;
  const contracts = network === "mainnet" ? CONTRACTS.mainnet : CONTRACTS.testnet;

  const value: NetworkContextType = {
    network,
    switchNetwork,
    chain,
    contracts,
    rpcUrl: RPC_URLS[network],
    publicClient,
    isMainnet: network === "mainnet",
    isTestnet: network === "testnet",
    explorerUrl: EXPLORER_URLS[network],
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  // Return default values for SSR/prerendering instead of throwing
  if (!context) {
    return defaultNetworkValue;
  }
  return context;
}

// Helper hook for contracts
export function useContracts() {
  const { contracts, network } = useNetwork();
  return { ...contracts, network };
}
