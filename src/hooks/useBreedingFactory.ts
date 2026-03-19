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
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const request = useCallback(async (
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

  return {
    request,
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
 * Approve breeding request (parent B owner)
 */
export function useApproveBreeding() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = useCallback(async (requestId: bigint) => {
    writeContract({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  }, [writeContract]);

  return {
    approve,
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
 * Execute breeding (after approval)
 */
export function useExecuteBreeding() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const execute = useCallback(async (
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

  return {
    execute,
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
 * Cancel breeding request (initiator only)
 */
export function useCancelBreeding() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const cancel = useCallback(async (requestId: bigint) => {
    writeContract({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  }, [writeContract]);

  return {
    cancel,
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
 * Get breeding request data
 */
export function useBreedingRequest(requestId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.breedingFactory as `0x${string}`,
    abi: BREEDING_FACTORY_ABI,
    functionName: "getRequest",
    args: requestId ? [requestId] : undefined,
    query: {
      enabled: !!requestId,
    },
  });
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
  return useReadContract({
    address: CONTRACTS.breedingFactory as `0x${string}`,
    abi: BREEDING_FACTORY_ABI,
    functionName: "breedingFee",
  });
}
