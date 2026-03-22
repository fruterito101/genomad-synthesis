// ============================================
// CONTRACT ADDRESSES - Base Network
// ============================================

export const CONTRACTS = {
  testnet: {
    // Base Sepolia - Deploy pending
    genomadNFT: process.env.NEXT_PUBLIC_TESTNET_GENOMAD_NFT || "",
    breedingFactory: process.env.NEXT_PUBLIC_TESTNET_BREEDING_FACTORY || "",
    traitVerifier: process.env.NEXT_PUBLIC_TESTNET_TRAIT_VERIFIER || "",
    gmdToken: process.env.NEXT_PUBLIC_TESTNET_GMD_TOKEN || "",
  },
  mainnet: {
    // Base Mainnet - Deploy pending for Synthesis Hackathon
    genomadNFT: process.env.NEXT_PUBLIC_MAINNET_GENOMAD_NFT || "",
    breedingFactory: process.env.NEXT_PUBLIC_MAINNET_BREEDING_FACTORY || "",
    traitVerifier: process.env.NEXT_PUBLIC_MAINNET_TRAIT_VERIFIER || "",
    gmdToken: process.env.NEXT_PUBLIC_MAINNET_GMD_TOKEN || "",
  },
} as const;

// ERC-8004 Identity Registry on Base Mainnet
export const ERC8004_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

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
