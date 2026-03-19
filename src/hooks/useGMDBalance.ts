// src/hooks/useGMDBalance.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatUnits } from "viem";
import { useNetwork } from "@/contexts/NetworkContext";

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

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
  const { user } = usePrivy();
  const { publicClient, contracts, network } = useNetwork();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;
  const gmdTokenAddress = contracts.gmdToken as `0x${string}`;

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !gmdTokenAddress || !publicClient) {
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const result = await publicClient.readContract({
        address: gmdTokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress],
      });

      setBalance(result as bigint);
    } catch (error) {
      console.error("Error fetching GMD balance:", error);
      setIsError(true);
      setBalance(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, gmdTokenAddress, publicClient]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, network]);

  // Format balance (18 decimals)
  const formatted = balance > 0 
    ? parseFloat(formatUnits(balance, 18)).toFixed(2)
    : "0";

  return {
    balance,
    formatted,
    decimals: 18,
    symbol: "GMD",
    isLoading,
    isError,
    refetch: fetchBalance,
  };
}

export default useGMDBalance;
