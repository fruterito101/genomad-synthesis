// src/hooks/useGMDBalance.ts
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

//  Token Address (Monad Testnet)
// NOTE: Currently disabled because wagmi is on Sepolia
// const GMD_TOKEN_ADDRESS = "0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777" as const;

export interface GMDBalanceResult {
  balance: bigint;
  formatted: string;
  decimals: number;
  symbol: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGMDBalance(): GMDBalanceResult {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // TEMPORARILY DISABLED: GMD token is on Monad but wagmi is configured for Sepolia
  // When we fix the Privy+Monad integration, we can re-enable this
  
  const refetch = () => {
    // No-op for now
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return {
    balance: BigInt(0),
    formatted: "0",
    decimals: 18,
    symbol: "GMD",
    isLoading,
    isError: false,
    refetch,
  };
}

export default useGMDBalance;
