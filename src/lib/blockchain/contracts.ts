// src/lib/blockchain/contracts.ts

import { getActiveContracts } from "./contracts.config";

/**
 * Contract addresses - From contracts.config.ts
 */
const activeContracts = getActiveContracts();

export const CONTRACTS = {
  genomadNFT: activeContracts.genomadNFT,
  breedingFactory: activeContracts.breedingFactory,
  traitVerifier: activeContracts.traitVerifier,
  reputationRegistry: activeContracts.reputationRegistry,
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
  // ERC-8004 functions
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "agentURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "newURI", type: "string" },
    ],
    name: "setAgentURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "metadataKey", type: "string" },
    ],
    name: "getMetadata",
    outputs: [{ name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "metadataKey", type: "string" },
      { name: "metadataValue", type: "bytes" },
    ],
    name: "setMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getAgentWallet",
    outputs: [{ name: "", type: "address" }],
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
    inputs: [{ name: "agentURI_", type: "string" }],
    name: "register",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "register",
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
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: false, name: "newURI", type: "string" },
      { indexed: true, name: "updatedBy", type: "address" },
    ],
    name: "URIUpdated",
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

/**
 * ReputationRegistry ABI (ERC-8004)
 */
export const REPUTATION_REGISTRY_ABI = [
  // Read functions
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddress", type: "address" },
    ],
    name: "getFeedbacks",
    outputs: [
      {
        components: [
          { name: "value", type: "int128" },
          { name: "valueDecimals", type: "uint8" },
          { name: "tag1", type: "string" },
          { name: "tag2", type: "string" },
          { name: "feedbackIndex", type: "uint64" },
          { name: "isRevoked", type: "bool" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getTotalFeedbackCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getAverageReputation",
    outputs: [
      { name: "average", type: "int256" },
      { name: "count", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "threshold", type: "int128" },
    ],
    name: "hasGoodReputation",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int128" },
      { name: "valueDecimals", type: "uint8" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "feedbackURI", type: "string" },
      { name: "feedbackHash", type: "bytes32" },
    ],
    name: "giveFeedback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int128" },
      { name: "tag1", type: "string" },
    ],
    name: "giveFeedbackSimple",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "feedbackIndex", type: "uint64" },
    ],
    name: "revokeFeedback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: true, name: "clientAddress", type: "address" },
      { indexed: false, name: "feedbackIndex", type: "uint64" },
      { indexed: false, name: "value", type: "int128" },
      { indexed: false, name: "valueDecimals", type: "uint8" },
      { indexed: true, name: "indexedTag1", type: "string" },
      { indexed: false, name: "tag1", type: "string" },
      { indexed: false, name: "tag2", type: "string" },
      { indexed: false, name: "endpoint", type: "string" },
      { indexed: false, name: "feedbackURI", type: "string" },
      { indexed: false, name: "feedbackHash", type: "bytes32" },
    ],
    name: "NewFeedback",
    type: "event",
  },
] as const;
