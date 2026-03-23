// src/hooks/useGenomadNFT.ts
// Hooks para interactuar con GenomadNFT contract

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/blockchain/contracts";
import { useCallback } from "react";

// ABI simplificado para register
const REGISTER_ABI = [
  {
    inputs: [],
    name: "register",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agentURI_", type: "string" }],
    name: "register",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ABI para otras funciones
const GENOMAD_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "activateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "deactivateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getAgentData",
    outputs: [
      {
        components: [
          { name: "dnaCommitment", type: "bytes32" },
          { name: "generation", type: "uint256" },
          { name: "parentA", type: "uint256" },
          { name: "parentB", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ============================================
// WRITE HOOKS
// ============================================

/**
 * Register a new agent on-chain (ERC-8004 style)
 */
export function useRegisterAgent() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  // Registrar sin URI (más simple)
  const register = useCallback(() => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: REGISTER_ABI,
      functionName: "register",
      args: [],
    });
  }, [writeContract]);

  const registerAsync = useCallback(async (dnaCommitment?: `0x${string}`) => {
    // Usar register() sin argumentos - más simple y confiable
    const txHash = await writeContractAsync({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: REGISTER_ABI,
      functionName: "register",
      args: [],
    });
    
    // TODO: Parsear tokenId del receipt
    return { txHash, tokenId: undefined };
  }, [writeContractAsync]);

  return {
    register,
    registerAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!error,
    receipt,
    error,
    reset,
  };
}

/**
 * Activate an agent (owner only)
 */
export function useActivateAgent() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const activate = useCallback((tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  }, [writeContract]);

  const activateAsync = useCallback(async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_ABI,
      functionName: "activateAgent",
      args: [tokenId],
    });
  }, [writeContractAsync]);

  return {
    activate,
    activateAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!error,
    receipt,
    error,
    reset,
  };
}

/**
 * Deactivate an agent (owner only)
 */
export function useDeactivateAgent() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const deactivate = useCallback((tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  }, [writeContract]);

  const deactivateAsync = useCallback(async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_ABI,
      functionName: "deactivateAgent",
      args: [tokenId],
    });
  }, [writeContractAsync]);

  return {
    deactivate,
    deactivateAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!error,
    receipt,
    error,
    reset,
  };
}

/**
 * Transfer an agent to another address
 */
export function useTransferAgent() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = useCallback((
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint
  ) => {
    writeContract({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  }, [writeContract]);

  const transferAsync = useCallback(async (
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint
  ) => {
    return writeContractAsync({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: GENOMAD_ABI,
      functionName: "transferFrom",
      args: [from, to, tokenId],
    });
  }, [writeContractAsync]);

  return {
    transfer,
    transferAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!error,
    receipt,
    error,
    reset,
  };
}

// ============================================
// READ HOOKS
// ============================================

export function useAgentData(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_ABI,
    functionName: "getAgentData",
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  });
}

export function useAgentOwner(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_ABI,
    functionName: "ownerOf",
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  });
}

export function useAgentBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useTotalAgents() {
  return useReadContract({
    address: CONTRACTS.genomadNFT as `0x${string}`,
    abi: GENOMAD_ABI,
    functionName: "totalSupply",
  });
}
