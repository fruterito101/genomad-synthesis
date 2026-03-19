// src/lib/blockchain/client.ts
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet, monadMainnet, activeChain } from "./chains";

// ============================================
// RPC URLs
// ============================================
const TESTNET_RPC = process.env.NEXT_PUBLIC_TESTNET_RPC || "https://testnet-rpc.monad.xyz";
const MAINNET_RPC = process.env.NEXT_PUBLIC_MAINNET_RPC || "https://rpc.monad.xyz";

// Get RPC for active chain
function getActiveRPC() {
  return activeChain.id === monadMainnet.id ? MAINNET_RPC : TESTNET_RPC;
}

// ============================================
// PUBLIC CLIENTS (Read operations)
// ============================================
export const publicClientTestnet = createPublicClient({
  chain: monadTestnet,
  transport: http(TESTNET_RPC),
});

export const publicClientMainnet = createPublicClient({
  chain: monadMainnet,
  transport: http(MAINNET_RPC),
});

// Active public client based on ENV
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(getActiveRPC()),
});

// Get public client by network
export function getPublicClient(network: "testnet" | "mainnet") {
  return network === "mainnet" ? publicClientMainnet : publicClientTestnet;
}

// ============================================
// WALLET CLIENT (Write operations - server-side)
// ============================================
export function createDeployerClient(network?: "testnet" | "mainnet") {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set");
  }

  const account = privateKeyToAccount(`0x${privateKey.replace("0x", "")}`);
  const chain = network === "mainnet" ? monadMainnet : 
                network === "testnet" ? monadTestnet : activeChain;
  const rpc = network === "mainnet" ? MAINNET_RPC : 
              network === "testnet" ? TESTNET_RPC : getActiveRPC();

  return createWalletClient({
    account,
    chain,
    transport: http(rpc),
  });
}

// ============================================
// HELPERS
// ============================================
export function getDeployerAddress(): string {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set");
  }

  const account = privateKeyToAccount(`0x${privateKey.replace("0x", "")}`);
  return account.address;
}

export function isMainnet(): boolean {
  return activeChain.id === monadMainnet.id;
}

export function isTestnet(): boolean {
  return activeChain.id === monadTestnet.id;
}
