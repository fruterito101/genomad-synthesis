// src/lib/blockchain/events/listener.ts
import { createPublicClient, http, parseAbiItem, type Address, type Log } from "viem";
import { monadTestnet, monadMainnet } from "../chains";
import { CONTRACTS } from "../contracts.config";
import { GENOMAD_NFT_ABI, BREEDING_FACTORY_ABI } from "../contracts";
import {
  handleAgentRegistered,
  handleTransfer,
  handleBreedingRequested,
  handleBreedingExecuted,
} from "./handlers";
import type { EventListenerConfig } from "./types";

// ============================================
// Event Definitions
// ============================================

const GENOMAD_EVENTS = {
  AgentRegistered: parseAbiItem(
    "event AgentRegistered(uint256 indexed tokenId, address indexed owner, bytes32 dnaCommitment, uint256 generation)"
  ),
  Transfer: parseAbiItem(
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ),
};

const BREEDING_EVENTS = {
  BreedingRequested: parseAbiItem(
    "event BreedingRequested(uint256 indexed requestId, uint256 indexed parentA, uint256 indexed parentB, address initiator)"
  ),
  BreedingExecuted: parseAbiItem(
    "event BreedingExecuted(uint256 indexed requestId, uint256 indexed childTokenId)"
  ),
};

// ============================================
// Event Listener Class
// ============================================

export class EventListener {
  private client;
  private config: EventListenerConfig;
  private isRunning = false;
  private unsubscribes: (() => void)[] = [];
  private lastProcessedBlock: bigint = 0n;

  constructor(config: EventListenerConfig) {
    this.config = config;
    
    const chain = config.network === "mainnet" ? monadMainnet : monadTestnet;
    const rpcUrl = config.network === "mainnet"
      ? "https://rpc.monad.xyz"
      : "https://testnet-rpc.monad.xyz";

    this.client = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
  }

  /**
   * Start listening for events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[LISTENER] Already running");
      return;
    }

    console.log("[LISTENER] Starting event listener...");
    console.log("[LISTENER] Network:", this.config.network);
    
    this.isRunning = true;

    // Get current block if no start block specified
    if (!this.config.startBlock) {
      const currentBlock = await this.client.getBlockNumber();
      this.lastProcessedBlock = currentBlock;
      console.log("[LISTENER] Starting from block:", currentBlock.toString());
    } else {
      this.lastProcessedBlock = this.config.startBlock;
    }

    // Start watching for events
    await this.watchGenomadNFT();
    await this.watchBreedingFactory();

    console.log("[LISTENER] Event listener started");
  }

  /**
   * Stop listening
   */
  stop(): void {
    console.log("[LISTENER] Stopping event listener...");
    this.isRunning = false;
    
    for (const unsub of this.unsubscribes) {
      unsub();
    }
    this.unsubscribes = [];
    
    console.log("[LISTENER] Event listener stopped");
  }

  /**
   * Watch GenomadNFT contract events
   */
  private async watchGenomadNFT(): Promise<void> {
    const contracts = this.config.network === "mainnet" 
      ? CONTRACTS.mainnet 
      : CONTRACTS.testnet;
    
    const address = (this.config.genomadNFT || contracts.genomadNFT) as Address;
    
    if (!address) {
      console.log("[LISTENER] GenomadNFT address not configured");
      return;
    }

    console.log("[LISTENER] Watching GenomadNFT:", address);

    // Watch AgentRegistered
    const unsubAgent = this.client.watchEvent({
      address,
      event: GENOMAD_EVENTS.AgentRegistered,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await handleAgentRegistered({
              tokenId: log.args.tokenId!,
              owner: log.args.owner!,
              dnaCommitment: log.args.dnaCommitment!,
              generation: log.args.generation!,
              blockNumber: log.blockNumber!,
              transactionHash: log.transactionHash!,
            });
          } catch (err) {
            console.error("[LISTENER] Error handling AgentRegistered:", err);
          }
        }
      },
    });
    this.unsubscribes.push(unsubAgent);

    // Watch Transfer
    const unsubTransfer = this.client.watchEvent({
      address,
      event: GENOMAD_EVENTS.Transfer,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await handleTransfer({
              from: log.args.from!,
              to: log.args.to!,
              tokenId: log.args.tokenId!,
              blockNumber: log.blockNumber!,
              transactionHash: log.transactionHash!,
            });
          } catch (err) {
            console.error("[LISTENER] Error handling Transfer:", err);
          }
        }
      },
    });
    this.unsubscribes.push(unsubTransfer);
  }

  /**
   * Watch BreedingFactory contract events
   */
  private async watchBreedingFactory(): Promise<void> {
    const contracts = this.config.network === "mainnet" 
      ? CONTRACTS.mainnet 
      : CONTRACTS.testnet;
    
    const address = (this.config.breedingFactory || contracts.breedingFactory) as Address;
    
    if (!address) {
      console.log("[LISTENER] BreedingFactory address not configured");
      return;
    }

    console.log("[LISTENER] Watching BreedingFactory:", address);

    // Watch BreedingRequested
    const unsubRequested = this.client.watchEvent({
      address,
      event: BREEDING_EVENTS.BreedingRequested,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await handleBreedingRequested({
              requestId: log.args.requestId!,
              parentA: log.args.parentA!,
              parentB: log.args.parentB!,
              initiator: log.args.initiator!,
              blockNumber: log.blockNumber!,
              transactionHash: log.transactionHash!,
            });
          } catch (err) {
            console.error("[LISTENER] Error handling BreedingRequested:", err);
          }
        }
      },
    });
    this.unsubscribes.push(unsubRequested);

    // Watch BreedingExecuted
    const unsubExecuted = this.client.watchEvent({
      address,
      event: BREEDING_EVENTS.BreedingExecuted,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await handleBreedingExecuted({
              requestId: log.args.requestId!,
              childTokenId: log.args.childTokenId!,
              blockNumber: log.blockNumber!,
              transactionHash: log.transactionHash!,
            });
          } catch (err) {
            console.error("[LISTENER] Error handling BreedingExecuted:", err);
          }
        }
      },
    });
    this.unsubscribes.push(unsubExecuted);
  }

  /**
   * Get listener status
   */
  getStatus(): { running: boolean; network: string; lastBlock: string } {
    return {
      running: this.isRunning,
      network: this.config.network,
      lastBlock: this.lastProcessedBlock.toString(),
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

let listenerInstance: EventListener | null = null;

export function getEventListener(config?: EventListenerConfig): EventListener {
  if (!listenerInstance && config) {
    listenerInstance = new EventListener(config);
  }
  
  if (!listenerInstance) {
    // Default config
    listenerInstance = new EventListener({
      network: "testnet",
    });
  }
  
  return listenerInstance;
}

export function startEventListener(config?: EventListenerConfig): EventListener {
  const listener = getEventListener(config);
  listener.start();
  return listener;
}

export function stopEventListener(): void {
  if (listenerInstance) {
    listenerInstance.stop();
  }
}
