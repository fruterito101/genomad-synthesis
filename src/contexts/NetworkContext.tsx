"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { monadTestnet, monadMainnet } from "@/lib/blockchain/chains";
import { CONTRACTS } from "@/lib/blockchain/contracts.config";

type Network = "testnet" | "mainnet";

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  chain: typeof monadTestnet;
  contracts: typeof CONTRACTS.testnet;
  isMainnet: boolean;
  isTestnet: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>("testnet");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("genomad-network") as Network;
    if (saved === "testnet" || saved === "mainnet") {
      setNetworkState(saved);
    }
  }, []);

  const setNetwork = (newNetwork: Network) => {
    localStorage.setItem("genomad-network", newNetwork);
    setNetworkState(newNetwork);
  };

  const value: NetworkContextType = {
    network,
    setNetwork,
    chain: network === "mainnet" ? monadMainnet : monadTestnet,
    contracts: network === "mainnet" ? CONTRACTS.mainnet : CONTRACTS.testnet,
    isMainnet: network === "mainnet",
    isTestnet: network === "testnet",
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}
