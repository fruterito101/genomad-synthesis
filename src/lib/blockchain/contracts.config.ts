// ============================================
// CONTRACT ADDRESSES - Testnet & Mainnet
// ============================================

export const CONTRACTS = {
  testnet: {
    genomadNFT: process.env.NEXT_PUBLIC_TESTNET_GENOMAD_NFT || "0x9f20494A0FbC929adAC553f4A2FCFa7D2b448Cf0",
    breedingFactory: process.env.NEXT_PUBLIC_TESTNET_BREEDING_FACTORY || "0x72D60f32185B67606a533dc28DeC3f88E05788De",
    gmdToken: process.env.NEXT_PUBLIC_TESTNET_GMD_TOKEN || "0x03DD45bA22F57b715a2F30C3C945E57DA0AC7777",
  },
  mainnet: {
    genomadNFT: process.env.NEXT_PUBLIC_MAINNET_GENOMAD_NFT || "",
    breedingFactory: process.env.NEXT_PUBLIC_MAINNET_BREEDING_FACTORY || "",
    gmdToken: process.env.NEXT_PUBLIC_MAINNET_GMD_TOKEN || "",
  },
} as const;

// Get contracts for specific network
export function getContracts(network: "testnet" | "mainnet") {
  return CONTRACTS[network];
}

// Get active contracts based on ENV
export function getActiveContracts() {
  const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";
  return isMainnet ? CONTRACTS.mainnet : CONTRACTS.testnet;
}

// Type for contract addresses
export type ContractAddresses = typeof CONTRACTS.testnet;
