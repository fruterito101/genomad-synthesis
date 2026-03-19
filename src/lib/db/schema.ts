// src/lib/db/schema.ts
// Definición de tablas para Genomad

import { 
  pgTable, 
  text, 
  timestamp, 
  integer,
  boolean,
  jsonb,
  uuid,
  varchar,
  index,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// USERS - Usuarios vinculados via Privy
// ============================================
export const users = pgTable("users", {
  // ID interno (UUID)
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Privy
  privyId: text("privy_id").unique().notNull(),
  
  // Telegram (de Privy)
  telegramId: text("telegram_id").unique(),
  telegramUsername: text("telegram_username"),
  
  // Wallet (de Privy)
  walletAddress: text("wallet_address"),
  
  // Profile
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
  index("users_privy_id_idx").on(table.privyId),
  index("users_telegram_id_idx").on(table.telegramId),
  index("users_wallet_idx").on(table.walletAddress),
]);

// ============================================
// AGENTS - Agentes registrados (DNA cache)
// ============================================
export const agents = pgTable("agents", {
  // ID interno
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Owner
  ownerId: uuid("owner_id").notNull(),
  
  // Identity
  name: text("name").notNull(),
  botUsername: text("bot_username"),
  
  // DNA (cache - source of truth is on-chain)
  dnaHash: text("dna_hash").unique().notNull(),
  traits: jsonb("traits").notNull(), // { social: 85, technical: 78, ... }
  fitness: real("fitness").notNull(),
  
  // Lineage
  generation: integer("generation").default(0).notNull(),
  parentAId: uuid("parent_a_id"),
  parentBId: uuid("parent_b_id"),
  lineage: jsonb("lineage").default([]).notNull(),
  
  // On-chain status
  tokenId: text("token_id"),
  contractAddress: text("contract_address"),
  mintedAt: timestamp("minted_at"),
  
  // Encrypted DNA
  encryptedDna: jsonb("encrypted_dna"),
  commitment: text("commitment"),
  
  // Status
  isActive: boolean("is_active").default(false).notNull(),
  activeHost: text("active_host"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("agents_owner_idx").on(table.ownerId),
  index("agents_dna_hash_idx").on(table.dnaHash),
  index("agents_token_id_idx").on(table.tokenId),
  index("agents_generation_idx").on(table.generation),
]);

// ============================================
// BREEDING REQUESTS
// ============================================
export const breedingRequests = pgTable("breeding_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Initiator
  initiatorId: uuid("initiator_id").notNull(),
  
  // Parents
  parentAId: uuid("parent_a_id").notNull(),
  parentBId: uuid("parent_b_id").notNull(),
  
  // Owners
  parentAOwnerId: uuid("parent_a_owner_id").notNull(),
  parentBOwnerId: uuid("parent_b_owner_id").notNull(),
  
  // Status: pending | approved | rejected | executed | expired | cancelled
  status: text("status").default("pending").notNull(),
  
  // Approvals
  parentAApproved: boolean("parent_a_approved").default(false).notNull(),
  parentBApproved: boolean("parent_b_approved").default(false).notNull(),
  parentAApprovedAt: timestamp("parent_a_approved_at"),
  parentBApprovedAt: timestamp("parent_b_approved_at"),
  
  // Options
  crossoverType: text("crossover_type").default("weighted").notNull(),
  childName: text("child_name"),
  
  // Fee
  feeAmount: text("fee_amount"),
  feePaid: boolean("fee_paid").default(false).notNull(),
  feeTxHash: text("fee_tx_hash"),
  
  // Result
  childId: uuid("child_id"),
  executedAt: timestamp("executed_at"),
  txHash: text("tx_hash"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => [
  index("breeding_initiator_idx").on(table.initiatorId),
  index("breeding_status_idx").on(table.status),
  index("breeding_parents_idx").on(table.parentAId, table.parentBId),
]);

// ============================================
// VERIFICATION CODES
// ============================================
export const verificationCodes = pgTable("verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Code (6-10 caracteres)
  code: varchar("code", { length: 10 }).unique().notNull(),
  
  // Owner
  userId: uuid("user_id").notNull(),
  
  // Status
  used: boolean("used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  agentId: uuid("agent_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => [
  index("verification_code_idx").on(table.code),
  index("verification_user_idx").on(table.userId),
]);

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  breedingRequestsInitiated: many(breedingRequests),
  verificationCodes: many(verificationCodes),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  owner: one(users, {
    fields: [agents.ownerId],
    references: [users.id],
  }),
  parentA: one(agents, {
    fields: [agents.parentAId],
    references: [agents.id],
    relationName: "parentA",
  }),
  parentB: one(agents, {
    fields: [agents.parentBId],
    references: [agents.id],
    relationName: "parentB",
  }),
  childrenAsParentA: many(agents, { relationName: "parentA" }),
  childrenAsParentB: many(agents, { relationName: "parentB" }),
}));

export const breedingRequestsRelations = relations(breedingRequests, ({ one }) => ({
  initiator: one(users, {
    fields: [breedingRequests.initiatorId],
    references: [users.id],
  }),
  parentA: one(agents, {
    fields: [breedingRequests.parentAId],
    references: [agents.id],
  }),
  parentB: one(agents, {
    fields: [breedingRequests.parentBId],
    references: [agents.id],
  }),
  child: one(agents, {
    fields: [breedingRequests.childId],
    references: [agents.id],
  }),
}));

export const verificationCodesRelations = relations(verificationCodes, ({ one }) => ({
  user: one(users, {
    fields: [verificationCodes.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [verificationCodes.agentId],
    references: [agents.id],
  }),
}));
