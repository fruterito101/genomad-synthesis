// src/hooks/useBreedingRead.ts
"use client";

import { useReadContract } from "wagmi";
import { useNetwork } from "@/contexts/NetworkContext";
import { BREEDING_FACTORY_ABI } from "@/lib/blockchain/contracts";
import { type Address } from "viem";

// Nota: useBreedingFee y useBreedingRequest ya están en useBreedingFactory.ts
// Este archivo tiene hooks adicionales de lectura

// ============================================
// useIsRequestValid
// Verifica si un breeding request sigue siendo válido
// ============================================
export function useIsRequestValid(requestId: bigint | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "isRequestValid",
    args: requestId !== undefined ? [requestId] : undefined,
    query: {
      enabled: !!address && requestId !== undefined,
    },
  });

  return {
    isValid: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// useBreedingRequestDetails
// Lee detalles completos de un breeding request
// ============================================
export function useBreedingRequestDetails(requestId: bigint | undefined) {
  const { contracts } = useNetwork();
  const address = contracts.breedingFactory as Address;

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "getRequest",
    args: requestId !== undefined ? [requestId] : undefined,
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
    status: number; // 0=Pending, 1=Approved, 2=Executed, 3=Cancelled, 4=Expired
    createdAt: bigint;
    expiresAt: bigint;
  } | undefined;

  // Status enum mapping
  const statusMap = ["pending", "approved", "executed", "cancelled", "expired"] as const;
  
  return {
    request: request ? {
      ...request,
      statusText: statusMap[request.status] || "unknown",
      isExpired: request.expiresAt < BigInt(Math.floor(Date.now() / 1000)),
    } : undefined,
    isLoading,
    error,
    refetch,
  };
}
