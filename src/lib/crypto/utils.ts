// src/lib/crypto/utils.ts
// Utilidades criptográficas generales

import { randomBytes, createHash } from "crypto";

/**
 * Genera string hexadecimal random criptográficamente seguro
 * 
 * @param bytes - Número de bytes (default 32 = 256 bits)
 * @returns String hexadecimal
 */
export function randomHex(bytes: number = 32): string {
  if (bytes <= 0 || bytes > 1024) {
    throw new Error("Bytes must be between 1 and 1024");
  }
  return randomBytes(bytes).toString("hex");
}

/**
 * Genera un nonce random para operaciones criptográficas
 */
export function generateNonce(): string {
  return randomHex(32);
}

/**
 * Hash SHA-256
 * 
 * @param data - Datos a hashear
 * @returns Hash en hexadecimal
 */
export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Hash SHA-256 con prefijo 0x (formato Ethereum)
 */
export function sha256Hex(data: string | Buffer): string {
  return "0x" + sha256(data);
}

/**
 * Hash Keccak-256 (usado en Ethereum)
 * Node.js usa sha3-256 que es diferente de keccak256
 * Para keccak256 real, usar librería 'keccak' o '@noble/hashes'
 * 
 * NOTA: Esta implementación usa SHA3-256 como aproximación
 * Para Ethereum real, necesitas keccak256
 */
export function sha3_256(data: string | Buffer): string {
  return createHash("sha3-256").update(data).digest("hex");
}

/**
 * Convierte string hexadecimal a Buffer
 * Maneja con o sin prefijo 0x
 */
export function hexToBytes(hex: string): Buffer {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    throw new Error("Invalid hex string");
  }
  
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  
  return Buffer.from(cleanHex, "hex");
}

/**
 * Convierte Buffer a string hexadecimal con prefijo 0x
 */
export function bytesToHex(bytes: Buffer): string {
  if (!Buffer.isBuffer(bytes)) {
    throw new Error("Input must be a Buffer");
  }
  return "0x" + bytes.toString("hex");
}

/**
 * Convierte Buffer a string hexadecimal sin prefijo
 */
export function bytesToHexRaw(bytes: Buffer): string {
  if (!Buffer.isBuffer(bytes)) {
    throw new Error("Input must be a Buffer");
  }
  return bytes.toString("hex");
}

/**
 * Compara dos buffers de forma segura (timing-safe)
 * Previene timing attacks
 */
export function secureCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

/**
 * Compara dos strings hex de forma segura
 */
export function secureCompareHex(a: string, b: string): boolean {
  try {
    const bufA = hexToBytes(a);
    const bufB = hexToBytes(b);
    return secureCompare(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Genera un ID único basado en timestamp y random
 */
export function generateUniqueId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = randomHex(8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Trunca un hash para display
 * 
 * @param hash - Hash completo
 * @param startChars - Caracteres al inicio (default 6)
 * @param endChars - Caracteres al final (default 4)
 * @returns Hash truncado (ej: "0x1234...abcd")
 */
export function truncateHash(
  hash: string, 
  startChars: number = 6, 
  endChars: number = 4
): string {
  const cleanHash = hash.startsWith("0x") ? hash : `0x${hash}`;
  
  if (cleanHash.length <= startChars + endChars + 2) {
    return cleanHash;
  }
  
  const start = cleanHash.slice(0, startChars + 2); // +2 for "0x"
  const end = cleanHash.slice(-endChars);
  
  return `${start}...${end}`;
}

/**
 * Valida que un string es un hash hexadecimal válido
 */
export function isValidHash(hash: string, expectedLength?: number): boolean {
  const cleanHash = hash.startsWith("0x") ? hash.slice(2) : hash;
  
  if (!/^[0-9a-fA-F]+$/.test(cleanHash)) {
    return false;
  }
  
  if (expectedLength && cleanHash.length !== expectedLength) {
    return false;
  }
  
  return true;
}

/**
 * Valida que es un hash SHA-256 válido (64 caracteres hex)
 */
export function isValidSha256(hash: string): boolean {
  return isValidHash(hash, 64);
}

/**
 * Codifica datos a base64 URL-safe
 */
export function toBase64Url(data: string | Buffer): string {
  const buffer = typeof data === "string" ? Buffer.from(data) : data;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Decodifica base64 URL-safe
 */
export function fromBase64Url(data: string): Buffer {
  const base64 = data
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  
  // Agregar padding si es necesario
  const padding = base64.length % 4;
  const paddedBase64 = padding 
    ? base64 + "=".repeat(4 - padding) 
    : base64;
  
  return Buffer.from(paddedBase64, "base64");
}
