// src/lib/db/index.ts
// Exports del módulo de base de datos

// Client
export { db, getDb, getSql, neon } from "./client";

// Schema
export * from "./schema";

// User operations
export {
  createUser,
  getUserById,
  getUserByPrivyId,
  getUserByTelegramId,
  getUserByWallet,
  updateUser,
  upsertUserByPrivyId,
  updateLastLogin,
  linkWallet,
  linkTelegram,
  deactivateUser,
  userExists,
} from "./users";
export type { User, NewUser } from "./users";

// Agent operations
export {
  createAgent,
  getAgentById,
  getAgentByDnaHash,
  getAgentByTokenId,
  getAgentsByOwner,
  getMintedAgentsByOwner,
  getChildrenOfAgent,
  getGenesisAgents,
  updateAgent,
  markAgentAsMinted,
  activateAgent,
  deactivateAgent,
  updateEncryptedDna,
  agentExistsByDnaHash,
  getAgentStats,
  getAgentsByGeneration,
  getTopAgentsByFitness,
} from "./agents";
export type { Agent, NewAgent, AgentTraits } from "./agents";

// Breeding operations
export {
  createBreedingRequest,
  getBreedingRequestById,
  getPendingRequestsForUser,
  approveBreedingRequest,
  rejectBreedingRequest,
  markBreedingExecuted,
  expireOldRequests,
  createVerificationCode,
  getVerificationCode,
  validateVerificationCode,
  useVerificationCode,
  getActiveCodeForUser,
  cleanupExpiredCodes,
} from "./breeding";
export type { 
  BreedingRequest, 
  NewBreedingRequest,
  VerificationCode,
  NewVerificationCode,
} from "./breeding";
