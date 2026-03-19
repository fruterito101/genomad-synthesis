// src/hooks/useBreedingFactory.ts
"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { BREEDING_FACTORY_ABI } from "@/lib/blockchain/contracts";
import { type Address } from "viem";

// ============================================
// useBreedingFee
// Lee el fee actual de breeding (SSR-safe)
// ============================================
export function useBreedingFee() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "breedingFee",
    query: {
      enabled: isMounted && !!address,
    },
  });

  if (!isMounted) {
    return {
      fee: undefined,
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }

  return {
    fee: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useRequestBreeding (SSR-safe)
// ============================================
export function useRequestBreeding() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "requestBreeding",
      args: [parentA, parentB],
      value: fee,
    });
  };

  const requestAsync = async (parentA: bigint, parentB: bigint, fee: bigint) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "requestBreeding",
      args: [parentA, parentB],
      value: fee,
    });
  };

  if (!isMounted) {
    return {
      request: () => {},
      requestAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

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
// useApproveBreeding (SSR-safe)
// ============================================
export function useApproveBreeding() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  };

  const approveAsync = async (requestId: bigint) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "approveBreeding",
      args: [requestId],
    });
  };

  if (!isMounted) {
    return {
      approve: () => {},
      approveAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

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
// useExecuteBreeding (SSR-safe)
// ============================================
export function useExecuteBreeding() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "executeBreeding",
      args: [requestId, dnaCommitment],
    });
  };

  const executeAsync = async (requestId: bigint, dnaCommitment: `0x${string}`) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "executeBreeding",
      args: [requestId, dnaCommitment],
    });
  };

  if (!isMounted) {
    return {
      execute: () => {},
      executeAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

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
// useCancelBreeding (SSR-safe)
// ============================================
export function useCancelBreeding() {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (!isMounted || !address) return;
    
    writeContract({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  };

  const cancelAsync = async (requestId: bigint) => {
    if (!isMounted || !address) throw new Error("Not ready");
    
    return writeContractAsync({
      address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "cancelBreeding",
      args: [requestId],
    });
  };

  if (!isMounted) {
    return {
      cancel: () => {},
      cancelAsync: async () => { throw new Error("Not mounted"); },
      hash: undefined,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: () => {},
    };
  }

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
// useBreedingRequest (SSR-safe)
// ============================================
export function useBreedingRequest(requestId: bigint | undefined) {
  const [isMounted, setIsMounted] = useState(false);
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "getRequest",
    args: requestId ? [requestId] : undefined,
    query: {
      enabled: isMounted && !!address && requestId !== undefined,
    },
  });

  if (!isMounted) {
    return {
      request: undefined,
      isLoading: false,
      error: null,
      refetch: () => {},
    };
  }

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
