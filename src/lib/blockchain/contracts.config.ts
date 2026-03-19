// ============================================
// CONTRACT ADDRESSES - Deployed 2026-03-01
// ============================================

export const CONTRACTS = {
  testnet: {
    genomadNFT: "0x190fd355ED38e82a2390C07222C4BcB4DbC4cD20",
    breedingFactory: "0x2703fb336139292c7ED854061072e316727ED7fA",
    traitVerifier: "0xaccaE8B19AD67df4Ce91638855c9B41A5Da90be3",
    gmdToken: process.env.NEXT_PUBLIC_TESTNET_GMD_TOKEN || "",
  },
  mainnet: {
    genomadNFT: process.env.NEXT_PUBLIC_MAINNET_GENOMAD_NFT || "",
    breedingFactory: process.env.NEXT_PUBLIC_MAINNET_BREEDING_FACTORY || "",
    traitVerifier: process.env.NEXT_PUBLIC_MAINNET_TRAIT_VERIFIER || "",
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
