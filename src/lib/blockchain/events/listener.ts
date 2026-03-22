// src/lib/blockchain/events/listener.ts
// Event listener service for Genomad contracts
// Uses polling approach compatible with Vercel serverless

import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import { baseTestnet } from "@/lib/blockchain/chains";
import { CONTRACTS } from "@/lib/blockchain/contracts";

// Public client for reading from chain
export const publicClient = createPublicClient({
  chain: baseTestnet,
  transport: http(),
});

// Event signatures
export const EVENTS = {
  AgentRegistered: parseAbiItem(
    "event AgentRegistered(uint256 indexed tokenId, address indexed owner, bytes32 dnaCommitment, uint256 generation)"
  ),
  Transfer: parseAbiItem(
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ),
  BreedingRequested: parseAbiItem(
    "event BreedingRequested(uint256 indexed requestId, uint256 indexed parentA, uint256 indexed parentB, address initiator)"
  ),
  BreedingApproved: parseAbiItem(
    "event BreedingApproved(uint256 indexed requestId)"
  ),
  BreedingExecuted: parseAbiItem(
    "event BreedingExecuted(uint256 indexed requestId, uint256 indexed childTokenId)"
  ),
  BreedingCancelled: parseAbiItem(
    "event BreedingCancelled(uint256 indexed requestId)"
  ),
};

// Types for parsed events
export interface AgentRegisteredEvent {
  tokenId: bigint;
  owner: string;
  dnaCommitment: string;
  generation: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export interface TransferEvent {
  from: string;
  to: string;
  tokenId: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export interface BreedingRequestedEvent {
  requestId: bigint;
  parentA: bigint;
  parentB: bigint;
  initiator: string;
  blockNumber: bigint;
  transactionHash: string;
}

export interface BreedingExecutedEvent {
  requestId: bigint;
  childTokenId: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

/**
 * Get the latest block number
 */
export async function getLatestBlock(): Promise<bigint> {
  return publicClient.getBlockNumber();
}

/**
 * Fetch AgentRegistered events from a block range
 */
export async function getAgentRegisteredEvents(
  fromBlock: bigint,
  toBlock: bigint
): Promise<AgentRegisteredEvent[]> {
  try {
    const logs = await publicClient.getLogs({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      event: EVENTS.AgentRegistered,
      fromBlock,
      toBlock,
    });

    return logs.map((log) => ({
      tokenId: (log.args as any).tokenId,
      owner: (log.args as any).owner,
      dnaCommitment: (log.args as any).dnaCommitment,
      generation: (log.args as any).generation,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    }));
  } catch (error) {
    console.error("Error fetching AgentRegistered events:", error);
    return [];
  }
}

/**
 * Fetch Transfer events from a block range
 */
export async function getTransferEvents(
  fromBlock: bigint,
  toBlock: bigint
): Promise<TransferEvent[]> {
  try {
    const logs = await publicClient.getLogs({
      address: CONTRACTS.genomadNFT as `0x${string}`,
      event: EVENTS.Transfer,
      fromBlock,
      toBlock,
    });

    return logs.map((log) => ({
      from: (log.args as any).from,
      to: (log.args as any).to,
      tokenId: (log.args as any).tokenId,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    }));
  } catch (error) {
    console.error("Error fetching Transfer events:", error);
    return [];
  }
}

/**
 * Fetch BreedingRequested events from a block range
 */
export async function getBreedingRequestedEvents(
  fromBlock: bigint,
  toBlock: bigint
): Promise<BreedingRequestedEvent[]> {
  try {
    const logs = await publicClient.getLogs({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      event: EVENTS.BreedingRequested,
      fromBlock,
      toBlock,
    });

    return logs.map((log) => ({
      requestId: (log.args as any).requestId,
      parentA: (log.args as any).parentA,
      parentB: (log.args as any).parentB,
      initiator: (log.args as any).initiator,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    }));
  } catch (error) {
    console.error("Error fetching BreedingRequested events:", error);
    return [];
  }
}

/**
 * Fetch BreedingExecuted events from a block range
 */
export async function getBreedingExecutedEvents(
  fromBlock: bigint,
  toBlock: bigint
): Promise<BreedingExecutedEvent[]> {
  try {
    const logs = await publicClient.getLogs({
      address: CONTRACTS.breedingFactory as `0x${string}`,
      event: EVENTS.BreedingExecuted,
      fromBlock,
      toBlock,
    });

    return logs.map((log) => ({
      requestId: (log.args as any).requestId,
      childTokenId: (log.args as any).childTokenId,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    }));
  } catch (error) {
    console.error("Error fetching BreedingExecuted events:", error);
    return [];
  }
}

/**
 * Fetch all relevant events from a block range
 */
export async function getAllEvents(fromBlock: bigint, toBlock: bigint) {
  const [agentRegistered, transfers, breedingRequested, breedingExecuted] =
    await Promise.all([
      getAgentRegisteredEvents(fromBlock, toBlock),
      getTransferEvents(fromBlock, toBlock),
      getBreedingRequestedEvents(fromBlock, toBlock),
      getBreedingExecutedEvents(fromBlock, toBlock),
    ]);

  return {
    agentRegistered,
    transfers,
    breedingRequested,
    breedingExecuted,
    fromBlock: fromBlock.toString(),
    toBlock: toBlock.toString(),
  };
}
