// src/hooks/useBreedingFactory.ts
"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { BREEDING_FACTORY_ABI } from "@/lib/blockchain/contracts";
import { type Address } from "viem";

// ============================================
// useBreedingFee
// Lee el fee actual de breeding
// ============================================
export function useBreedingFee() {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "breedingFee",
    query: {
      enabled: !!address,
    },
  });

  return {
    fee: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useRequestBreeding
// Solicita breeding entre dos agentes (paga fee)
// ============================================
export function useRequestBreeding() {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const request = (parentA: bigint, parentB: bigint, fee: bigint) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "requestBreeding",
      args: [parentA, parentB],
      value: fee,
    });
  };

  const requestAsync = async (parentA: bigint, parentB: bigint, fee: bigint) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "requestBreeding",
      args: [parentA, parentB],
      value: fee,
    });
  };

  return {
    request,
    requestAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useApproveBreeding
// El dueño del parent B aprueba el breeding
// ============================================
export function useApproveBreeding() {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const approve = (requestId: bigint) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  };

  const approveAsync = async (requestId: bigint) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  };

  return {
    approve,
    approveAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useExecuteBreeding
// Ejecuta el breeding y mintea el hijo
// ============================================
export function useExecuteBreeding() {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const execute = (requestId: bigint, dnaCommitment: `0x${string}`) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "executeBreeding",
      args: [requestId, dnaCommitment],
    });
  };

  const executeAsync = async (requestId: bigint, dnaCommitment: `0x${string}`) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "executeBreeding",
      args: [requestId, dnaCommitment],
    });
  };

  return {
    execute,
    executeAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useCancelBreeding
// Cancela un breeding request
// ============================================
export function useCancelBreeding() {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const cancel = (requestId: bigint) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  };

  const cancelAsync = async (requestId: bigint) => {
    if (!address) throw new Error("BreedingFactory not configured");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  };

  return {
    cancel,
    cancelAsync,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!(writeError || receiptError),
    error: writeError || receiptError,
    reset,
  };
}

// ============================================
// useBreedingRequest
// Lee los datos de un breeding request
// ============================================
export function useBreedingRequest(requestId: bigint | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "getRequest",
    args: requestId ? [requestId] : undefined,
    query: {
      enabled: !!address && requestId !== undefined,
    },
  });

  // Parse the tuple response
  const request = data as {
    parentA: bigint;
    parentB: bigint;
    initiator: Address;
    parentBOwner: Address;
    parentBApproved: boolean;
    status: number;
    createdAt: bigint;
    expiresAt: bigint;
  } | undefined;

  return {
    request,
    isLoading,
    error,
    refetch,
  };
}
