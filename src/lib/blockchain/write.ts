// src/lib/blockchain/write.ts
import { publicClient, createDeployerClient } from "./client";
import { CONTRACTS, GENOMAD_NFT_ABI, BREEDING_FACTORY_ABI } from "./contracts";
import type { Address, Hash } from "viem";

export interface TransactionResult {
  hash: Hash;
  success: boolean;
  error?: string;
}

/**
 * Register a new agent on-chain
 */
export async function registerAgentOnChain(
  dnaCommitment: `0x${string}`
): Promise<{ hash: Hash; tokenId: bigint }> {
  if (!CONTRACTS.genomadNFT) {
    throw new Error("GenomadNFT contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.genomadNFT as Address,
    abi: GENOMAD_NFT_ABI,
    functionName: "registerAgent",
    args: [dnaCommitment],
  });

  // Wait for transaction
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  // Parse tokenId from logs
  const tokenId = 0n; // TODO: Parse from AgentRegistered event

  return { hash, tokenId };
}

/**
 * Activate an agent
 */
export async function activateAgentOnChain(tokenId: bigint): Promise<Hash> {
  if (!CONTRACTS.genomadNFT) {
    throw new Error("GenomadNFT contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.genomadNFT as Address,
    abi: GENOMAD_NFT_ABI,
    functionName: "activateAgent",
    args: [tokenId],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

/**
 * Deactivate an agent
 */
export async function deactivateAgentOnChain(tokenId: bigint): Promise<Hash> {
  if (!CONTRACTS.genomadNFT) {
    throw new Error("GenomadNFT contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.genomadNFT as Address,
    abi: GENOMAD_NFT_ABI,
    functionName: "deactivateAgent",
    args: [tokenId],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

/**
 * Request breeding between two agents
 */
export async function requestBreedingOnChain(
  parentA: bigint,
  parentB: bigint,
  fee: bigint
): Promise<{ hash: Hash; requestId: bigint }> {
  if (!CONTRACTS.breedingFactory) {
    throw new Error("BreedingFactory contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.breedingFactory as Address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "requestBreeding",
    args: [parentA, parentB],
    value: fee,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  // TODO: Parse requestId from BreedingRequested event
  const requestId = 0n;

  return { hash, requestId };
}

/**
 * Approve a breeding request
 */
export async function approveBreedingOnChain(requestId: bigint): Promise<Hash> {
  if (!CONTRACTS.breedingFactory) {
    throw new Error("BreedingFactory contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.breedingFactory as Address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "approveBreeding",
    args: [requestId],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

/**
 * Execute breeding and mint child
 */
export async function executeBreedingOnChain(
  requestId: bigint,
  dnaCommitment: `0x${string}`
): Promise<{ hash: Hash; childTokenId: bigint }> {
  if (!CONTRACTS.breedingFactory) {
    throw new Error("BreedingFactory contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.breedingFactory as Address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "executeBreeding",
    args: [requestId, dnaCommitment],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  // TODO: Parse childTokenId from BreedingExecuted event
  const childTokenId = 0n;

  return { hash, childTokenId };
}

/**
 * Cancel a breeding request
 */
export async function cancelBreedingOnChain(requestId: bigint): Promise<Hash> {
  if (!CONTRACTS.breedingFactory) {
    throw new Error("BreedingFactory contract not configured");
  }

  const client = createDeployerClient();

  const hash = await client.writeContract({
    address: CONTRACTS.breedingFactory as Address,
    abi: BREEDING_FACTORY_ABI,
    functionName: "cancelBreeding",
    args: [requestId],
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}
