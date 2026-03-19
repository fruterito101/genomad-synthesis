// src/lib/blockchain/contracts.ts

/**
 * Contract addresses - UPDATE AFTER DEPLOYMENT
 */
export const CONTRACTS = {
  genomadNFT: process.env.NEXT_PUBLIC_GENOMAD_NFT_ADDRESS || "",
  breedingFactory: process.env.NEXT_PUBLIC_BREEDING_FACTORY_ADDRESS || "",
} as const;

/**
 * GenomadNFT ABI (minimal for frontend)
 */
export const GENOMAD_NFT_ABI = [
  // Read functions
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getAgentData",
    outputs: [
      {
        components: [
          { name: "dnaCommitment", type: "bytes32" },
          { name: "generation", type: "uint256" },
          { name: "parentA", type: "uint256" },
          { name: "parentB", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [{ name: "dnaCommitment", type: "bytes32" }],
    name: "registerAgent",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "activateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "deactivateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "dnaCommitment", type: "bytes32" },
      { indexed: false, name: "generation", type: "uint256" },
    ],
    name: "AgentRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
] as const;

/**
 * BreedingFactory ABI (minimal for frontend)
 */
export const BREEDING_FACTORY_ABI = [
  // Read functions
  {
    inputs: [{ name: "requestId", type: "uint256" }],
    name: "getRequest",
    outputs: [
      {
        components: [
          { name: "parentA", type: "uint256" },
          { name: "parentB", type: "uint256" },
          { name: "initiator", type: "address" },
          { name: "parentBOwner", type: "address" },
          { name: "parentBApproved", type: "bool" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "requestId", type: "uint256" }],
    name: "isRequestValid",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "breedingFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "parentA", type: "uint256" },
      { name: "parentB", type: "uint256" },
    ],
    name: "requestBreeding",
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "requestId", type: "uint256" }],
    name: "approveBreeding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "dnaCommitment", type: "bytes32" },
    ],
    name: "executeBreeding",
    outputs: [{ name: "childTokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "requestId", type: "uint256" }],
    name: "cancelBreeding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "parentA", type: "uint256" },
      { indexed: true, name: "parentB", type: "uint256" },
      { indexed: false, name: "initiator", type: "address" },
    ],
    name: "BreedingRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "childTokenId", type: "uint256" },
    ],
    name: "BreedingExecuted",
    type: "event",
  },
] as const;
