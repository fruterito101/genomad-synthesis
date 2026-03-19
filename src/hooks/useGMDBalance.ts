// src/hooks/useGMDBalance.ts
"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useBlockNumber } from "wagmi";
import { formatUnits } from "viem";

// $GMD Token Address
const GMD_TOKEN_ADDRESS = "0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777" as const;

// ERC20 ABI (solo balanceOf)
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
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
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [lastRefetch, setLastRefetch] = useState(0);

  // Fetch balance
  const { 
    data: balanceData, 
    isLoading: balanceLoading, 
    isError: balanceError,
    refetch: refetchBalance 
  } = useReadContract({
    address: GMD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Fetch decimals
  const { data: decimalsData } = useReadContract({
    address: GMD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: isConnected,
    },
  });

  // Fetch symbol
  const { data: symbolData } = useReadContract({
    address: GMD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: isConnected,
    },
  });

  // Auto-refetch on new blocks (throttled)
  useEffect(() => {
    if (blockNumber && isConnected && Date.now() - lastRefetch > 10000) {
      refetchBalance();
      setLastRefetch(Date.now());
    }
  }, [blockNumber, isConnected, refetchBalance, lastRefetch]);

  const decimals = decimalsData ?? 18;
  const balance = balanceData ?? BigInt(0);
  const formatted = formatUnits(balance, decimals);

  // Format for display (max 2 decimals, with commas)
  const displayFormatted = Number(formatted).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return {
    balance,
    formatted: displayFormatted,
    decimals,
    symbol: symbolData ?? "GMD",
    isLoading: balanceLoading,
    isError: balanceError,
    refetch: refetchBalance,
  };
}

export default useGMDBalance;
