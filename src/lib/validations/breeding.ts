// src/lib/validations/breeding.ts
// Zod schemas for breeding-related data

import { z } from "zod";

// ============================================
// BREEDING REQUEST
// ============================================

export const breedingRequestSchema = z.object({
  parentAId: z.string()
    .uuid("parentAId debe ser un UUID válido"),
  
  parentBId: z.string()
    .uuid("parentBId debe ser un UUID válido"),
  
  childName: z.string()
    .min(2, "Nombre muy corto (mín 2)")
    .max(50, "Nombre muy largo (máx 50)")
    .regex(/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]+$/, "Caracteres inválidos")
    .optional(),
  
  crossoverType: z.enum(["uniform", "single", "weighted"])
    .default("weighted"),
    
  // On-chain token IDs (optional, for on-chain breeding)
  parentATokenId: z.string().optional(),
  parentBTokenId: z.string().optional(),
  
  // Whether to use on-chain breeding
  useOnChain: z.boolean().optional().default(false),
}).refine(
  (data) => data.parentAId !== data.parentBId,
  { message: "No se puede hacer breeding con el mismo agente", path: ["parentBId"] }
);

export type BreedingRequestInput = z.infer<typeof breedingRequestSchema>;

// ============================================
// BREEDING APPROVAL
// ============================================

export const breedingApprovalSchema = z.object({
  requestId: z.string()
    .uuid("requestId debe ser un UUID válido"),
    
  // On-chain request ID (optional)
  onChainRequestId: z.string().optional(),
});

export type BreedingApprovalInput = z.infer<typeof breedingApprovalSchema>;

// ============================================
// BREEDING EXECUTION
// ============================================

export const breedingExecuteSchema = z.object({
  requestId: z.string()
    .uuid("requestId debe ser un UUID válido"),
  
  childName: z.string()
    .min(2, "Nombre muy corto")
    .max(50, "Nombre muy largo")
    .regex(/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]+$/, "Caracteres inválidos"),
    
  // DNA commitment for on-chain (optional)
  dnaCommitment: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Commitment debe ser bytes32 hex")
    .optional(),
});

export type BreedingExecuteInput = z.infer<typeof breedingExecuteSchema>;

// ============================================
// BREEDING CANCEL
// ============================================

export const breedingCancelSchema = z.object({
  requestId: z.string()
    .uuid("requestId debe ser un UUID válido"),
    
  reason: z.string()
    .max(500, "Razón muy larga")
    .optional(),
});

export type BreedingCancelInput = z.infer<typeof breedingCancelSchema>;

// ============================================
// ON-CHAIN SYNC
// ============================================

export const breedingOnChainSyncSchema = z.object({
  onChainRequestId: z.string().optional(),
  txHash: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "txHash debe ser hash válido"),
  action: z.enum(["request", "approve", "execute", "cancel"]),
  childTokenId: z.string().optional(),
});

export type BreedingOnChainSyncInput = z.infer<typeof breedingOnChainSyncSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function validateBreedingRequest(data: unknown) {
  const result = breedingRequestSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true as const, data: result.data };
}

export function validateBreedingApproval(data: unknown) {
  const result = breedingApprovalSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true as const, data: result.data };
}

export function validateBreedingExecute(data: unknown) {
  const result = breedingExecuteSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true as const, data: result.data };
}
