import { base } from "viem/chains";
import { defineChain } from "viem";

// ============================================
// BASE MAINNET (Primary for Synthesis Hackathon)
// ============================================
export const baseMainnet = base;

// ============================================
// BASE SEPOLIA TESTNET
// ============================================
export const baseTestnet = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: { 
      name: "BaseScan", 
      url: "https://sepolia.basescan.org" 
    },
  },
  testnet: true,
});

// ============================================
// CHAIN SELECTION (via ENV)
// ============================================
// Set NEXT_PUBLIC_NETWORK=mainnet for production
// Default: testnet
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";

export const activeChain = isMainnet ? baseMainnet : baseTestnet;

// Export both for flexibility
export const chains = {
  testnet: baseTestnet,
  mainnet: baseMainnet,
};

// Helper to get chain by network name
export function getChain(network: "testnet" | "mainnet") {
  return network === "mainnet" ? baseMainnet : baseTestnet;
}
