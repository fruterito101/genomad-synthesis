import { defineChain } from "viem";

// ============================================
// MONAD TESTNET
// ============================================
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { 
      name: "Monad Explorer", 
      url: "https://testnet.monadexplorer.com" 
    },
  },
  testnet: true,
});

// ============================================
// MONAD MAINNET
// ============================================
export const monadMainnet = defineChain({
  id: 1, // TODO: Actualizar con el chainId real de Monad Mainnet cuando se lance
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { 
      name: "Monad Explorer", 
      url: "https://monadexplorer.com" 
    },
  },
  testnet: false,
});

// ============================================
// CHAIN SELECTION (via ENV)
// ============================================
// Set NEXT_PUBLIC_NETWORK=mainnet for production
// Default: testnet
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";

export const activeChain = isMainnet ? monadMainnet : monadTestnet;

// Export both for flexibility
export const chains = {
  testnet: monadTestnet,
  mainnet: monadMainnet,
};

// Helper to get chain by network name
export function getChain(network: "testnet" | "mainnet") {
  return network === "mainnet" ? monadMainnet : monadTestnet;
}
