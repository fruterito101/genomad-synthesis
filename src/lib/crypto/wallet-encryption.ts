// src/lib/crypto/wallet-encryption.ts
// Ticket 4.9: Encriptación con Wallet para datos on-chain
// Permite encriptar SOUL/IDENTITY para que solo el dueño pueda leer

import { EncryptedData, CRYPTO_CONSTANTS } from "./types";
import { encrypt, decrypt, generateSymmetricKey } from "./symmetric";
import { sha256 } from "./utils";

const { KEY_LENGTH } = CRYPTO_CONSTANTS;

/**
 * Datos encriptados para on-chain storage
 */
export interface OnChainEncryptedData {
  /** Datos encriptados (ciphertext + iv + tag) */
  encrypted: EncryptedData;
  /** Hash de la wallet que puede desencriptar */
  authorizedWallet: string;
  /** Hash del contenido original (para verificación) */
  contentHash: string;
  /** Nonce usado para derivar la clave */
  keyNonce: string;
  /** Timestamp de encriptación */
  encryptedAt: number;
}

/**
 * Datos encriptados para múltiples dueños (co-custodia)
 */
export interface MultiOwnerEncryptedData {
  /** Mapa de wallet -> datos encriptados */
  byOwner: Record<string, OnChainEncryptedData>;
  /** Hash del contenido (mismo para todos) */
  contentHash: string;
  /** Timestamp */
  encryptedAt: number;
}

/**
 * Deriva una clave de encriptación desde la wallet address
 * La clave es determinística dado wallet + nonce
 * 
 * @param walletAddress - Address de la wallet (0x...)
 * @param nonce - Nonce único para esta encriptación
 * @returns Clave AES-256 (32 bytes)
 */
export function deriveKeyFromWallet(
  walletAddress: string,
  nonce: string
): Buffer {
  // Normalizar address
  const normalizedAddress = walletAddress.toLowerCase();
  
  // Derivar clave: hash(address + nonce)
  // En producción, usar HKDF para key derivation más seguro
  const combined = `genomad:${normalizedAddress}:${nonce}`;
  const keyHex = sha256(combined);
  
  return Buffer.from(keyHex.slice(0, KEY_LENGTH * 2), "hex");
}

/**
 * Encripta contenido para una wallet específica
 * Solo esa wallet podrá desencriptar
 * 
 * @param content - Contenido a encriptar (SOUL.md, IDENTITY.md, etc)
 * @param walletAddress - Wallet que podrá desencriptar
 * @returns Datos encriptados listos para on-chain
 */
export function encryptForWallet(
  content: string,
  walletAddress: string
): OnChainEncryptedData {
  // Generar nonce único
  const keyNonce = generateSymmetricKey().toString("hex");
  
  // Derivar clave
  const key = deriveKeyFromWallet(walletAddress, keyNonce);
  
  // Encriptar
  const result = encrypt(content, key);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Encryption failed");
  }
  
  // Calcular hash del contenido original
  const contentHash = sha256(content);
  
  return {
    encrypted: result.data,
    authorizedWallet: walletAddress.toLowerCase(),
    contentHash,
    keyNonce,
    encryptedAt: Date.now(),
  };
}

/**
 * Desencripta contenido usando tu wallet
 * 
 * @param encryptedData - Datos encriptados
 * @param walletAddress - Tu wallet address
 * @returns Contenido original
 */
export function decryptWithWallet(
  encryptedData: OnChainEncryptedData,
  walletAddress: string
): string {
  // Verificar que esta wallet está autorizada
  if (encryptedData.authorizedWallet !== walletAddress.toLowerCase()) {
    throw new Error("Wallet not authorized to decrypt this data");
  }
  
  // Derivar clave
  const key = deriveKeyFromWallet(walletAddress, encryptedData.keyNonce);
  
  // Desencriptar
  const result = decrypt(encryptedData.encrypted, key);
  if (!result.success || result.plaintext === undefined) {
    throw new Error(result.error || "Decryption failed");
  }
  
  // Verificar integridad
  const decryptedHash = sha256(result.plaintext);
  if (decryptedHash !== encryptedData.contentHash) {
    throw new Error("Content integrity check failed");
  }
  
  return result.plaintext;
}

/**
 * Encripta contenido para múltiples dueños (co-custodia)
 * Cada dueño recibe una copia que solo él puede desencriptar
 * 
 * @param content - Contenido a encriptar
 * @param walletAddresses - Lista de wallets que pueden desencriptar
 * @returns Datos encriptados para cada dueño
 */
export function encryptForMultipleOwners(
  content: string,
  walletAddresses: string[]
): MultiOwnerEncryptedData {
  const contentHash = sha256(content);
  const byOwner: Record<string, OnChainEncryptedData> = {};
  
  for (const wallet of walletAddresses) {
    byOwner[wallet.toLowerCase()] = encryptForWallet(content, wallet);
  }
  
  return {
    byOwner,
    contentHash,
    encryptedAt: Date.now(),
  };
}

/**
 * Desencripta contenido de multi-owner data
 */
export function decryptFromMultiOwner(
  multiData: MultiOwnerEncryptedData,
  walletAddress: string
): string {
  const normalized = walletAddress.toLowerCase();
  const myData = multiData.byOwner[normalized];
  
  if (!myData) {
    throw new Error("Wallet not found in authorized owners");
  }
  
  return decryptWithWallet(myData, walletAddress);
}

/**
 * Serializa datos encriptados para almacenar on-chain
 * Retorna bytes que se pueden almacenar directamente en el contrato
 */
export function serializeForOnChain(data: OnChainEncryptedData): string {
  return JSON.stringify({
    c: data.encrypted.ciphertext,
    i: data.encrypted.iv,
    t: data.encrypted.tag,
    n: data.keyNonce,
    h: data.contentHash,
  });
}

/**
 * Deserializa datos de on-chain
 */
export function deserializeFromOnChain(
  serialized: string,
  authorizedWallet: string
): OnChainEncryptedData {
  const parsed = JSON.parse(serialized);
  return {
    encrypted: {
      ciphertext: parsed.c,
      iv: parsed.i,
      tag: parsed.t,
      algorithm: "aes-256-gcm",
    },
    authorizedWallet: authorizedWallet.toLowerCase(),
    contentHash: parsed.h,
    keyNonce: parsed.n,
    encryptedAt: Date.now(),
  };
}

/**
 * Prepara datos de SOUL y IDENTITY para on-chain storage
 */
export function prepareAgentDataForChain(
  soulContent: string,
  identityContent: string,
  ownerWallet: string
): {
  encryptedSoul: string;
  encryptedIdentity: string;
  contentHash: string;
} {
  const encSoul = encryptForWallet(soulContent, ownerWallet);
  const encIdentity = encryptForWallet(identityContent, ownerWallet);
  
  // Hash combinado para verificación
  const contentHash = sha256(soulContent + identityContent);
  
  return {
    encryptedSoul: serializeForOnChain(encSoul),
    encryptedIdentity: serializeForOnChain(encIdentity),
    contentHash,
  };
}

/**
 * Recupera datos de agente desde on-chain
 */
export function recoverAgentDataFromChain(
  encryptedSoul: string,
  encryptedIdentity: string,
  ownerWallet: string
): {
  soul: string;
  identity: string;
} {
  const soulData = deserializeFromOnChain(encryptedSoul, ownerWallet);
  const identityData = deserializeFromOnChain(encryptedIdentity, ownerWallet);
  
  return {
    soul: decryptWithWallet(soulData, ownerWallet),
    identity: decryptWithWallet(identityData, ownerWallet),
  };
}
