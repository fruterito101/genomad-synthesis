// src/types/breeding.ts
// Re-export from source of truth
export {
  type BreedingOptions,
  type BreedingResult,
  type PopulationOptions,
} from "@/lib/genetic/types";

// API-specific breeding types
export interface BreedingRequest {
  id: string;
  initiatorId: string;
  parentATokenId: string;
  parentBTokenId: string;
  parentBOwnerId?: string;
  status: "pending" | "approved" | "rejected" | "executed" | "expired";
  feeAmount: string;
  childTokenId?: string;
  childName?: string;
  createdAt: Date;
  expiresAt: Date;
  approvedAt?: Date;
  executedAt?: Date;
}
