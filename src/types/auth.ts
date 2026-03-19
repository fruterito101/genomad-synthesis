// src/types/auth.ts

/**
 * Usuario en nuestro sistema (sincronizado con Privy)
 */
export interface User {
  /** ID interno */
  id: string;
  
  /** Privy user ID */
  privyId: string;
  
  /** Telegram ID (de Privy) */
  telegramId?: number;
  
  /** Telegram username */
  telegramUsername?: string;
  
  /** Wallet address principal */
  walletAddress?: string;
  
  /** Timestamp de creación */
  createdAt: Date;
  
  /** Último login */
  lastLoginAt: Date;
}

/**
 * Sesión de usuario
 */
export interface Session {
  userId: string;
  privyId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Código de verificación para vincular OpenClaw
 */
export interface VerificationCode {
  code: string;
  userId: string;
  telegramId: number;
  expiresAt: Date;
  used: boolean;
}

/**
 * Request de verificación desde OpenClaw
 */
export interface VerifyAgentRequest {
  /** Código de verificación */
  code: string;
  
  /** Telegram ID del bot */
  telegramId: number;
  
  /** Nombre del agente */
  agentName: string;
  
  /** Username del bot */
  botUsername: string;
  
  /** Archivos del agente */
  files: {
    soul: string;
    identity: string;
    tools: string;
  };
}

/**
 * Respuesta de verificación
 */
export interface VerifyAgentResponse {
  success: boolean;
  message: string;
  agentId?: string;
  tokenId?: string;
  traits?: {
    social: number;
    technical: number;
    creativity: number;
    analysis: number;
    trading: number;
    empathy: number;
    teaching: number;
    leadership: number;
  };
}

/**
 * Datos de Privy user (simplificado)
 */
export interface PrivyUserData {
  id: string;
  createdAt: Date;
  telegram?: {
    telegramUserId: string;
    username?: string;
    firstName?: string;
    photoUrl?: string;
  };
  wallet?: {
    address: string;
    chainType: string;
  };
  linkedAccounts: Array<{
    type: string;
    address?: string;
    username?: string;
  }>;
}

/**
 * Auth state para el frontend
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  hasTelegram: boolean;
  hasWallet: boolean;
  isComplete: boolean;
}
