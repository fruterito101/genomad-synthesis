// src/types/api.ts

import { Agent, AgentDNA } from "./agent";
import { BreedingRequest, BreedingResult } from "./breeding";
import { User } from "./auth";

/**
 * Response base para todas las APIs
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ AGENTS API ============

export interface GetAgentsParams extends PaginationParams {
  ownerId?: string;
  generation?: number;
  isActive?: boolean;
  minFitness?: number;
}

export interface GetAgentsResponse extends PaginatedResponse<Agent> {}

export interface GetAgentResponse {
  agent: Agent;
  parents?: {
    parentA: Agent | null;
    parentB: Agent | null;
  };
  children?: Agent[];
}

export interface RegisterAgentRequest {
  verificationCode: string;
}

export interface RegisterAgentResponse {
  agent: Agent;
  tokenId: string;
  txHash: string;
}

// ============ BREEDING API ============

export interface CreateBreedingRequest {
  parentATokenId: string;
  parentBTokenId: string;
  childName?: string;
}

export interface ApproveBreedingRequest {
  requestId: string;
  signature: string;
}

export interface ExecuteBreedingRequest {
  requestId: string;
}

export interface ExecuteBreedingResponse {
  result: BreedingResult;
  request: BreedingRequest;
  txHash: string;
}

export interface GetBreedingHistoryParams extends PaginationParams {
  agentId?: string;
  userId?: string;
  status?: string;
}

// ============ RENTAL API ============

export interface ListAgentForRentRequest {
  agentTokenId: string;
  pricePerDay: string; // in $GENO
  minDays: number;
  maxDays: number;
  allowSubRent?: boolean;
}

export interface RentAgentRequest {
  agentTokenId: string;
  days: number;
}

export interface RentAgentResponse {
  rentalId: string;
  agentTokenId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: string;
  txHash: string;
}

// ============ MARKETPLACE API ============

export interface MarketplaceFilters extends PaginationParams {
  type?: "breeding" | "rental" | "sale";
  minFitness?: number;
  maxPrice?: string;
  generation?: number;
  traits?: Partial<Record<string, { min?: number; max?: number }>>;
}

export interface MarketplaceItem {
  agent: Agent;
  type: "breeding" | "rental" | "sale";
  price: string;
  currency: "GENO" | "MON";
  availableUntil?: Date;
  owner: {
    id: string;
    username?: string;
  };
}

// ============ USER API ============

export interface GetUserProfileResponse {
  user: User;
  agents: Agent[];
  stats: {
    totalAgents: number;
    totalBreedings: number;
    totalEarnings: string;
  };
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}
