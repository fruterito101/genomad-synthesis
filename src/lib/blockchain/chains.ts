import { defineChain } from "viem";

// ============================================
// MONAD TESTNET - Configuración Principal
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
// MONAD MAINNET - Para futuro
// ============================================
export const monadMainnet = defineChain({
  id: 10143, // Actualizar cuando salga mainnet
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
// CHAIN ACTIVA
// ============================================
export const activeChain = monadTestnet;

// Legacy alias (para compatibilidad)
export const sepoliaTestnet = monadTestnet;
