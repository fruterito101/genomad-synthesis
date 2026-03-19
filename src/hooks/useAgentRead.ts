// src/hooks/useAgentRead.ts
"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";
import { type Address } from "viem";

// ============================================
// useAgentData
// Lee los datos on-chain de un agente
// ============================================
export function useAgentData(tokenId: bigint | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: GENOMAD_NFT_ABI,
    functionName: "getAgentData",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!address && tokenId !== undefined,
    },
  });

  // Parse the tuple response
  const agentData = data as {
    dnaCommitment: `0x${string}`;
    generation: bigint;
    parentA: bigint;
    parentB: bigint;
    createdAt: bigint;
    isActive: boolean;
  } | undefined;

  return {
    data: agentData,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useAgentOwner
// Lee el owner de un tokenId
// ============================================
export function useAgentOwner(tokenId: bigint | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: GENOMAD_NFT_ABI,
    functionName: "ownerOf",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!address && tokenId !== undefined,
    },
  });

  return {
    owner: data as Address | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useTotalSupply
// Lee el total de agentes minteados
// ============================================
export function useTotalSupply() {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: GENOMAD_NFT_ABI,
    functionName: "totalSupply",
    query: {
      enabled: !!address,
    },
  });

  return {
    totalSupply: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useAgentBalance
// Lee cuántos agentes tiene una wallet
// ============================================
export function useAgentBalance(account: Address | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: GENOMAD_NFT_ABI,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: {
      enabled: !!address && !!account,
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useTokenURI
// Lee la URI de metadata de un token
// ============================================
export function useTokenURI(tokenId: bigint | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: GENOMAD_NFT_ABI,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!address && tokenId !== undefined,
    },
  });

  return {
    tokenURI: data as string | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useMultipleAgents
// Lee datos de múltiples agentes en una llamada
// ============================================
export function useMultipleAgents(tokenIds: bigint[]) {
  const { contracts } = useNetwork();
  const address = contracts.genomadNFT as Address;

  const contracts_calls = tokenIds.map((tokenId) => ({
    address,
    abi: GENOMAD_NFT_ABI,
    functionName: "getAgentData" as const,
    args: [tokenId] as const,
  }));

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: contracts_calls,
    query: {
      enabled: !!address && tokenIds.length > 0,
    },
  });

  const agents = data?.map((result, index) => {
    if (result.status === "success") {
      const agentData = result.result as {
        dnaCommitment: `0x${string}`;
        generation: bigint;
        parentA: bigint;
        parentB: bigint;
        createdAt: bigint;
        isActive: boolean;
      };
      return {
        tokenId: tokenIds[index],
        ...agentData,
      };
    }
    return null;
  }).filter(Boolean);

  return {
    agents,
    isLoading,
    error,
    refetch,
  };
}
