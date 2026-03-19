// src/lib/blockchain/index.ts

// Chains
export { monadTestnet, monadMainnet } from "./chains";

// Clients
export { publicClient, createDeployerClient, getDeployerAddress } from "./client";

// Contracts
export { CONTRACTS, GENOMAD_NFT_ABI, BREEDING_FACTORY_ABI } from "./contracts";

// Read operations
export {
  getAgentOnChain,
  getAgentOwner,
  getTotalSupply,
  getAgentBalance,
  getBreedingRequest,
  getBreedingFee,
  isBreedingRequestValid,
} from "./read";
export type { OnChainAgentData, BreedingRequestData } from "./read";

// Write operations
export {
  registerAgentOnChain,
  activateAgentOnChain,
  deactivateAgentOnChain,
  requestBreedingOnChain,
  approveBreedingOnChain,
  executeBreedingOnChain,
  cancelBreedingOnChain,
} from "./write";
export type { TransactionResult } from "./write";
