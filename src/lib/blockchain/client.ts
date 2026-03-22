// src/lib/blockchain/client.ts
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { baseTestnet, baseMainnet, activeChain } from "./chains";

// ============================================
// RPC URLs
// ============================================
const TESTNET_RPC = process.env.NEXT_PUBLIC_TESTNET_RPC || "https://sepolia.base.org";
const MAINNET_RPC = process.env.NEXT_PUBLIC_MAINNET_RPC || "https://mainnet.base.org";

// Get RPC for active chain
function getActiveRPC() {
  return activeChain.id === baseMainnet.id ? MAINNET_RPC : TESTNET_RPC;
}

// ============================================
// PUBLIC CLIENTS (Read operations)
// ============================================
export const publicClientTestnet = createPublicClient({
  chain: baseTestnet,
  transport: http(TESTNET_RPC),
});

export const publicClientMainnet = createPublicClient({
  chain: baseMainnet,
  transport: http(MAINNET_RPC),
});

// Active public client based on ENV
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(getActiveRPC()),
});

// ============================================
// WALLET CLIENT (Write operations - server-side only)
// ============================================
const getPrivateKey = () => {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    throw new Error("PRIVATE_KEY not set in environment");
  }
  return key as `0x${string}`;
};

// Lazy-loaded wallet client (only when needed for writes)
let _walletClient: ReturnType<typeof createWalletClient> | null = null;

export function getWalletClient() {
  if (!_walletClient) {
    const account = privateKeyToAccount(getPrivateKey());
    _walletClient = createWalletClient({
      account,
      chain: activeChain,
      transport: http(getActiveRPC()),
    });
  }
  return _walletClient;
}

// ============================================
// HELPERS
// ============================================
export function getPublicClient(network: "testnet" | "mainnet") {
  return network === "mainnet" ? publicClientMainnet : publicClientTestnet;
}

export function getRpcUrl(network: "testnet" | "mainnet") {
  return network === "mainnet" ? MAINNET_RPC : TESTNET_RPC;
}

// Export chain info
export { activeChain };
export const CHAIN_ID = activeChain.id;
export const CHAIN_NAME = activeChain.name;
