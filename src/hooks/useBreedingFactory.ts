// src/hooks/useBreedingFactory.ts
// Hooks para interactuar con BreedingFactory contract

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS, BREEDING_FACTORY_ABI } from "@/lib/blockchain/contracts";
import { useCallback } from "react";
import { parseEther } from "viem";

// ============================================
// WRITE HOOKS
// ============================================

/**
 * Request breeding between two agents (initiator pays fee)
 */
export function useRequestBreeding() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const request = useCallback((
    parentATokenId: bigint,
    parentBTokenId: bigint,
    feeAmount: string = "0.001" // Default fee in MON
  ) => {
    writeContract({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "requestBreeding",
      args: [parentATokenId, parentBTokenId],
      value: parseEther(feeAmount),
    });
  }, [writeContract]);

  const requestAsync = useCallback(async (
    parentATokenId: bigint,
    parentBTokenId: bigint,
    feeAmount: string = "0.001"
  ) => {
    return writeContractAsync({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "requestBreeding",
      args: [parentATokenId, parentBTokenId],
      value: parseEther(feeAmount),
    });
  }, [writeContractAsync]);

  return {
    request,
    requestAsync,
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
 * Approve breeding request (parent B owner)
 */
export function useApproveBreeding() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = useCallback((requestId: bigint) => {
    writeContract({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  }, [writeContract]);

  const approveAsync = useCallback(async (requestId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  }, [writeContractAsync]);

  return {
    approve,
    approveAsync,
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
 * Execute breeding (after approval)
 */
export function useExecuteBreeding() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const execute = useCallback((
    requestId: bigint,
    childDnaCommitment: `0x${string}`
  ) => {
    writeContract({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "executeBreeding",
      args: [requestId, childDnaCommitment],
    });
  }, [writeContract]);

  const executeAsync = useCallback(async (
    requestId: bigint,
    childDnaCommitment: `0x${string}`
  ) => {
    return writeContractAsync({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "executeBreeding",
      args: [requestId, childDnaCommitment],
    });
  }, [writeContractAsync]);

  return {
    execute,
    executeAsync,
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
 * Cancel breeding request (initiator only)
 */
export function useCancelBreeding() {
  const { writeContract, writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const cancel = useCallback((requestId: bigint) => {
    writeContract({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  }, [writeContract]);

  const cancelAsync = useCallback(async (requestId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  }, [writeContractAsync]);

  return {
    cancel,
    cancelAsync,
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

/**
 * Get breeding request data
 */
export function useBreedingRequest(requestId: bigint | undefined) {
  const result = useReadContract({
    address: CONTRACTS.breedingFactory as `0x${string}`,
    abi: BREEDING_FACTORY_ABI,
    functionName: "getRequest",
    args: requestId ? [requestId] : undefined,
    query: {
      enabled: !!requestId,
    },
  });

  return {
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Check if request is valid
 */
export function useIsRequestValid(requestId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.breedingFactory as `0x${string}`,
    abi: BREEDING_FACTORY_ABI,
    functionName: "isRequestValid",
    args: requestId ? [requestId] : undefined,
    query: {
      enabled: !!requestId,
    },
  });
}

/**
 * Get current breeding fee
 */
export function useBreedingFee() {
  const result = useReadContract({
    address: CONTRACTS.breedingFactory as `0x${string}`,
    abi: BREEDING_FACTORY_ABI,
    functionName: "breedingFee",
  });

  return {
    fee: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
