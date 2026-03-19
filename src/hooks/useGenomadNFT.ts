// src/hooks/useGenomadNFT.ts
// Hooks para interactuar con GenomadNFT contract

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS, GENOMAD_NFT_ABI } from "@/lib/blockchain/contracts";
import { useCallback } from "react";

// ============================================
// WRITE HOOKS
// ============================================

/**
 * Register a new agent on-chain
 */
export function useRegisterAgent() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const register = useCallback(async (dnaCommitment: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_NFT_ABI,
      functionName: "registerAgent",
      args: [dnaCommitment],
    });
  }, [writeContract]);

  return {
    register,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    receipt,
    error,
    reset,
  };
}

/**
 * Activate an agent (owner only)
 */
export function useActivateAgent() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const activate = useCallback(async (tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_NFT_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  }, [writeContract]);

  return {
    activate,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    receipt,
    error,
    reset,
  };
}

/**
 * Deactivate an agent (owner only)
 */
export function useDeactivateAgent() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const deactivate = useCallback(async (tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_NFT_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  }, [writeContract]);

  return {
    deactivate,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    receipt,
    error,
    reset,
  };
}

/**
 * Transfer an agent to another address
 */
export function useTransferAgent() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = useCallback(async (
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint
  ) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_NFT_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  }, [writeContract]);

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    receipt,
    error,
    reset,
  };
}

// ============================================
// READ HOOKS
// ============================================

/**
 * Get agent data by tokenId
 */
export function useAgentData(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_NFT_ABI,
    functionName: "getAgentData",
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });
}

/**
 * Get owner of a token
 */
export function useAgentOwner(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_NFT_ABI,
    functionName: "ownerOf",
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });
}

/**
 * Get balance of an address
 */
export function useAgentBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Get total supply of agents
 */
export function useTotalAgents() {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_NFT_ABI,
    functionName: "totalSupply",
  });
}
