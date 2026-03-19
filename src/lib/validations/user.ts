// src/lib/validations/user.ts
// Zod schemas for user-related data

import { z } from "zod";

// ============================================
// ETHEREUM ADDRESS
// ============================================

export const ethereumAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum inválida")
  .transform(val => val.toLowerCase() as `0x${string}`);

// ============================================
// USER PROFILE UPDATE
// ============================================

export const userProfileUpdateSchema = z.object({
  displayName: z.string()
    .min(2, "Nombre muy corto")
    .max(50, "Nombre muy largo")
    .regex(/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]+$/, "Caracteres inválidos")
    .optional(),
    
  avatarUrl: z.string()
    .url("URL de avatar inválida")
    .max(500, "URL muy larga")
    .optional()
    .nullable(),
    
  bio: z.string()
    .max(500, "Bio muy larga")
    .optional()
    .nullable(),
});

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

// ============================================
// USER REGISTRATION (from Privy)
// ============================================

export const userRegistrationSchema = z.object({
  privyId: z.string()
    .min(1, "privyId requerido"),
    
  walletAddress: ethereumAddressSchema.optional(),
  
  telegramId: z.string()
    .max(50)
    .optional()
    .nullable(),
    
  telegramUsername: z.string()
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username de Telegram inválido")
    .optional()
    .nullable(),
    
  email: z.string()
    .email("Email inválido")
    .max(255)
    .optional()
    .nullable(),
    
  displayName: z.string()
    .min(2)
    .max(50)
    .optional()
    .nullable(),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

// ============================================
// WALLET LINKING
// ============================================

export const walletLinkSchema = z.object({
  walletAddress: ethereumAddressSchema,
  
  signature: z.string()
    .regex(/^0x[a-fA-F0-9]+$/, "Firma inválida")
    .optional(),
    
  message: z.string()
    .max(1000)
    .optional(),
});

export type WalletLinkInput = z.infer<typeof walletLinkSchema>;

// ============================================
// TELEGRAM LINKING
// ============================================

export const telegramLinkSchema = z.object({
  telegramId: z.string()
    .min(1, "telegramId requerido"),
    
  telegramUsername: z.string()
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username inválido")
    .optional(),
    
  // Telegram auth data
  authDate: z.number().int().positive().optional(),
  hash: z.string().optional(),
});

export type TelegramLinkInput = z.infer<typeof telegramLinkSchema>;

// ============================================
// VERIFICATION CODE
// ============================================

export const verificationCodeSchema = z.object({
  code: z.string()
    .length(6, "Código debe ser de 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Código debe ser alfanumérico mayúsculas"),
});

export type VerificationCodeInput = z.infer<typeof verificationCodeSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function validateUserProfile(data: unknown) {
  const result = userProfileUpdateSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true as const, data: result.data };
}

export function validateUserRegistration(data: unknown) {
  const result = userRegistrationSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true as const, data: result.data };
}

export function validateVerificationCode(data: unknown) {
  const result = verificationCodeSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
  
  return { valid: true as const, data: result.data };
}

export function isValidEthereumAddress(address: string): boolean {
  return ethereumAddressSchema.safeParse(address).success;
}
