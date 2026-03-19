// src/lib/blockchain/events/types.ts
import type { Address, Hash, Log } from "viem";

// ============================================
// Event Types - GenomadNFT
// ============================================

export interface AgentRegisteredEvent {
  tokenId: bigint;
  owner: Address;
  dnaCommitment: `0x${string}`;
  generation: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface TransferEvent {
  from: Address;
  to: Address;
  tokenId: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

// ============================================
// Event Types - BreedingFactory
// ============================================

export interface BreedingRequestedEvent {
  requestId: bigint;
  parentA: bigint;
  parentB: bigint;
  initiator: Address;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface BreedingApprovedEvent {
  requestId: bigint;
  approver: Address;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface BreedingExecutedEvent {
  requestId: bigint;
  childTokenId: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface BreedingCancelledEvent {
  requestId: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

// ============================================
// Handler Types
// ============================================

export type EventHandler<T> = (event: T) => Promise<void>;

export interface EventListenerConfig {
  network: "testnet" | "mainnet";
  genomadNFT?: Address;
  breedingFactory?: Address;
  startBlock?: bigint;
  pollingInterval?: number; // ms
}
