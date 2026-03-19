// src/lib/crypto/types.ts
// Tipos para el sistema de encriptación de Genomad

/**
 * Datos encriptados con AES-256-GCM
 * GCM provee autenticación (detecta tampering)
 */
export interface EncryptedData {
  /** Datos encriptados en base64 */
  ciphertext: string;
  /** Initialization Vector (16 bytes, base64) */
  iv: string;
  /** Authentication Tag (16 bytes, base64) - CRÍTICO para GCM */
  tag: string;
  /** Algoritmo usado */
  algorithm: "aes-256-gcm";
}

/**
 * Par de llaves ECDH (secp256k1 - compatible con Ethereum)
 */
export interface KeyPair {
  /** Llave pública en hex (se puede compartir) */
  publicKey: string;
  /** Llave privada en hex (NUNCA compartir/exponer) */
  privateKey: string;
}

/**
 * Commitment para esquema commit-reveal
 * Permite publicar un hash sin revelar el valor
 */
export interface Commitment {
  /** Hash SHA256(value + nonce) */
  hash: string;
  /** Nonce random para hide-reveal (hex) */
  nonce: string;
}

/**
 * Mensaje firmado con su firma y llave pública
 */
export interface SignedMessage {
  /** Mensaje original */
  message: string;
  /** Firma ECDSA (hex) */
  signature: string;
  /** Llave pública del firmante (hex) */
  publicKey: string;
  /** Timestamp de firma */
  timestamp: number;
}

/**
 * DNA encriptado para almacenamiento
 * Cada padre tiene su propia copia encriptada
 */
export interface EncryptedDNA {
  /** DNA encriptado para Parent A (solo A puede leer) */
  forParentA: EncryptedData;
  /** DNA encriptado para Parent B (solo B puede leer) */
  forParentB: EncryptedData;
  /** Commitment público (va on-chain) */
  commitment: string;
  /** Hash del DNA (público, para verificación) */
  dnaHash: string;
  /** Timestamp de encriptación */
  encryptedAt: number;
}

/**
 * Resultado de operación de encriptación
 */
export interface EncryptionResult {
  success: boolean;
  data?: EncryptedData;
  error?: string;
}

/**
 * Resultado de operación de desencriptación
 */
export interface DecryptionResult {
  success: boolean;
  plaintext?: string;
  error?: string;
}

/**
 * Resultado de verificación de firma
 */
export interface VerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Constantes de seguridad
 */
export const CRYPTO_CONSTANTS = {
  /** Tamaño de IV para AES-GCM (bytes) */
  IV_LENGTH: 16,
  /** Tamaño de key para AES-256 (bytes) */
  KEY_LENGTH: 32,
  /** Tamaño de auth tag para GCM (bytes) */
  TAG_LENGTH: 16,
  /** Curva elíptica (compatible con Ethereum) */
  CURVE: "secp256k1",
  /** Algoritmo de encriptación */
  ALGORITHM: "aes-256-gcm",
} as const;
