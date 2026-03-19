// src/lib/blockchain/read.ts
import { publicClient } from "./client";
import { CONTRACTS, GENOMAD_NFT_ABI, BREEDING_FACTORY_ABI } from "./contracts";
import type { Address } from "viem";

export interface OnChainAgentData {
  dnaCommitment: `0x${string}`;
  generation: bigint;
  parentA: bigint;
  parentB: bigint;
  createdAt: bigint;
  isActive: boolean;
}

export interface BreedingRequestData {
  parentA: bigint;
  parentB: bigint;
  initiator: Address;
  parentBOwner: Address;
  parentBApproved: boolean;
  status: number;
  createdAt: bigint;
  expiresAt: bigint;
}

/**
 * Get agent data from blockchain
 */
export async function getAgentOnChain(tokenId: bigint): Promise<OnChainAgentData | null> {
  if (!CONTRACTS.genomadNFT) return null;

  try {
    const data = await publicClient.readContract({
      address: CONTRACTS.genomadNFT as Address,
      abi: GENOMAD_NFT_ABI,
      functionName: "getAgentData",
      args: [tokenId],
    });

    return data as OnChainAgentData;
  } catch {
    return null;
  }
}

/**
 * Get agent owner
 */
export async function getAgentOwner(tokenId: bigint): Promise<Address | null> {
  if (!CONTRACTS.genomadNFT) return null;

  try {
    const owner = await publicClient.readContract({
      address: CONTRACTS.genomadNFT as Address,
      abi: GENOMAD_NFT_ABI,
      functionName: "ownerOf",
      args: [tokenId],
    });

    return owner as Address;
  } catch {
    return null;
  }
}

/**
 * Get total supply of agents
 */
export async function getTotalSupply(): Promise<bigint> {
  if (!CONTRACTS.genomadNFT) return 0n;

  try {
    const supply = await publicClient.readContract({
      address: CONTRACTS.genomadNFT as Address,
      abi: GENOMAD_NFT_ABI,
      functionName: "totalSupply",
    });

    return supply as bigint;
  } catch {
    return 0n;
  }
}

/**
 * Get user's agent balance
 */
export async function getAgentBalance(address: Address): Promise<bigint> {
  if (!CONTRACTS.genomadNFT) return 0n;

  try {
    const balance = await publicClient.readContract({
      address: CONTRACTS.genomadNFT as Address,
      abi: GENOMAD_NFT_ABI,
      functionName: "balanceOf",
      args: [address],
    });

    return balance as bigint;
  } catch {
    return 0n;
  }
}

/**
 * Get breeding request data
 */
export async function getBreedingRequest(requestId: bigint): Promise<BreedingRequestData | null> {
  if (!CONTRACTS.breedingFactory) return null;

  try {
    const data = await publicClient.readContract({
      address: CONTRACTS.breedingFactory as Address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "getRequest",
      args: [requestId],
    });

    return data as BreedingRequestData;
  } catch {
    return null;
  }
}

/**
 * Get current breeding fee
 */
export async function getBreedingFee(): Promise<bigint> {
  if (!CONTRACTS.breedingFactory) return 0n;

  try {
    const fee = await publicClient.readContract({
      address: CONTRACTS.breedingFactory as Address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "breedingFee",
    });

    return fee as bigint;
  } catch {
    return 0n;
  }
}

/**
 * Check if breeding request is valid
 */
export async function isBreedingRequestValid(requestId: bigint): Promise<boolean> {
  if (!CONTRACTS.breedingFactory) return false;

  try {
    const valid = await publicClient.readContract({
      address: CONTRACTS.breedingFactory as Address,
      abi: BREEDING_FACTORY_ABI,
      functionName: "isRequestValid",
      args: [requestId],
    });

    return valid as boolean;
  } catch {
    return false;
  }
}
