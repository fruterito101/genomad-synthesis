// src/hooks/useGenomadNFT.ts
// Hooks para interactuar con GenomadNFT contract

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from "wagmi";
import { CONTRACTS } from "@/lib/blockchain/contracts";
import { useCallback } from "react";
import { decodeEventLog, type Hash } from "viem";

// ABI para register
const REGISTER_ABI = [
  {
    inputs: [],
    name: "register",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ABI para eventos
const EVENTS_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "dnaCommitment", type: "bytes32" },
      { indexed: false, name: "generation", type: "uint256" },
    ],
    name: "AgentRegistered",
    type: "event",
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
] as const;

// Helper para parsear tokenId de los logs
function parseTokenIdFromLogs(logs: any[]): bigint | undefined {
  for (const log of logs) {
    try {
      // Intentar decodificar Transfer event (from = 0x0 significa mint)
      const decoded = decodeEventLog({
        abi: EVENTS_ABI,
        data: log.data,
        topics: log.topics,
      });
      
      if (decoded.eventName === "Transfer" && decoded.args) {
        const args = decoded.args as { from: string; to: string; tokenId: bigint };
        // Si from es zero address, es un mint
        if (args.from === "0x0000000000000000000000000000000000000000") {
          console.log("[useGenomadNFT] Found tokenId from Transfer event:", args.tokenId);
          return args.tokenId;
        }
      }
      
      if (decoded.eventName === "AgentRegistered" && decoded.args) {
        const args = decoded.args as { tokenId: bigint };
        console.log("[useGenomadNFT] Found tokenId from AgentRegistered event:", args.tokenId);
        return args.tokenId;
      }
    } catch (e) {
      // No es este evento, continuar
    }
  }
  return undefined;
}

// ============================================
// WRITE HOOKS
// ============================================

/**
 * Register a new agent on-chain (ERC-8004 style)
 */
export function useRegisterAgent() {
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  const publicClient = usePublicClient();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const registerAsync = useCallback(async (_dnaCommitment?: `0x${string}`) => {
    console.log("[useGenomadNFT] Starting register()...");
    
    // 1. Enviar transacción
    const txHash = await writeContractAsync({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      abi: REGISTER_ABI,
      functionName: "register",
      args: [],
    });
    
    console.log("[useGenomadNFT] TX sent:", txHash);
    
    // 2. Esperar confirmación y obtener receipt
    if (!publicClient) {
      console.warn("[useGenomadNFT] No publicClient, returning without tokenId");
      return { txHash, tokenId: undefined };
    }
    
    console.log("[useGenomadNFT] Waiting for receipt...");
    const txReceipt = await publicClient.waitForTransactionReceipt({ 
      hash: txHash,
      confirmations: 1,
    });
    
    console.log("[useGenomadNFT] Receipt received, logs:", txReceipt.logs.length);
    
    // 3. Parsear tokenId de los logs
    const tokenId = parseTokenIdFromLogs(txReceipt.logs);
    
    if (tokenId) {
      console.log("[useGenomadNFT] ✅ Parsed tokenId:", tokenId.toString());
    } else {
      console.warn("[useGenomadNFT] ⚠️ Could not parse tokenId from logs");
    }
    
    return { txHash, tokenId: tokenId?.toString() };
  }, [writeContractAsync, publicClient]);

  return {
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
