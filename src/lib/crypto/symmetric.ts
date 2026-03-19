// src/lib/crypto/symmetric.ts
// Encriptación simétrica AES-256-GCM
// GCM = Galois/Counter Mode (provee autenticación)

import { 
  randomBytes, 
  createCipheriv, 
  createDecipheriv,
  CipherGCMTypes
} from "crypto";
import { 
  EncryptedData, 
  EncryptionResult, 
  DecryptionResult,
  CRYPTO_CONSTANTS 
} from "./types";

const { IV_LENGTH, KEY_LENGTH, TAG_LENGTH, ALGORITHM } = CRYPTO_CONSTANTS;

/**
 * Genera una clave simétrica AES-256 (32 bytes)
 * Usa crypto.randomBytes que es criptográficamente seguro
 */
export function generateSymmetricKey(): Buffer {
  return randomBytes(KEY_LENGTH);
}

/**
 * Valida que una clave tiene el tamaño correcto
 */
export function validateKey(key: Buffer): boolean {
  return Buffer.isBuffer(key) && key.length === KEY_LENGTH;
}

/**
 * Encripta datos con AES-256-GCM
 * 
 * @param plaintext - Texto a encriptar
 * @param key - Clave AES-256 (32 bytes)
 * @returns Datos encriptados con IV y auth tag
 * 
 * SEGURIDAD:
 * - IV es random y único por cada encriptación
 * - GCM provee autenticación (detecta modificaciones)
 * - Tag se incluye para verificar integridad
 */
export function encrypt(plaintext: string, key: Buffer): EncryptionResult {
  try {
    // Validar key
    if (!validateKey(key)) {
      return {
        success: false,
        error: `Invalid key: must be ${KEY_LENGTH} bytes`
      };
    }

    // Validar input
    if (typeof plaintext !== "string" || plaintext.length === 0) {
      return {
        success: false,
        error: "Plaintext must be a non-empty string"
      };
    }

    // Generar IV random (CRÍTICO: nunca reusar con la misma key)
    const iv = randomBytes(IV_LENGTH);

    // Crear cipher
    const cipher = createCipheriv(
      ALGORITHM as CipherGCMTypes, 
      key, 
      iv,
      { authTagLength: TAG_LENGTH }
    );

    // Encriptar
    let ciphertext = cipher.update(plaintext, "utf8", "base64");
    ciphertext += cipher.final("base64");

    // Obtener auth tag (CRÍTICO para GCM)
    const tag = cipher.getAuthTag();

    return {
      success: true,
      data: {
        ciphertext,
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        algorithm: "aes-256-gcm"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

/**
 * Desencripta datos con AES-256-GCM
 * 
 * @param encrypted - Datos encriptados
 * @param key - Clave AES-256 (32 bytes)
 * @returns Texto original o error
 * 
 * SEGURIDAD:
 * - Verifica auth tag antes de desencriptar
 * - Falla si datos fueron modificados (tampering detection)
 */
export function decrypt(encrypted: EncryptedData, key: Buffer): DecryptionResult {
  try {
    // Validar key
    if (!validateKey(key)) {
      return {
        success: false,
        error: `Invalid key: must be ${KEY_LENGTH} bytes`
      };
    }

    // Validar estructura de datos encriptados
    if (!encrypted.ciphertext || !encrypted.iv || !encrypted.tag) {
      return {
        success: false,
        error: "Invalid encrypted data structure"
      };
    }

    // Decodificar IV y tag
    const iv = Buffer.from(encrypted.iv, "base64");
    const tag = Buffer.from(encrypted.tag, "base64");

    // Validar tamaños
    if (iv.length !== IV_LENGTH) {
      return {
        success: false,
        error: `Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`
      };
    }

    if (tag.length !== TAG_LENGTH) {
      return {
        success: false,
        error: `Invalid tag length: expected ${TAG_LENGTH}, got ${tag.length}`
      };
    }

    // Crear decipher
    const decipher = createDecipheriv(
      ALGORITHM as CipherGCMTypes, 
      key, 
      iv,
      { authTagLength: TAG_LENGTH }
    );

    // Establecer auth tag (CRÍTICO: debe hacerse antes de final())
    decipher.setAuthTag(tag);

    // Desencriptar
    let plaintext = decipher.update(encrypted.ciphertext, "base64", "utf8");
    plaintext += decipher.final("utf8");

    return {
      success: true,
      plaintext
    };
  } catch (error) {
    // Si el tag no coincide, crypto lanza error
    // Esto indica tampering o clave incorrecta
    return {
      success: false,
      error: `Decryption failed: ${error instanceof Error ? error.message : "Authentication failed - data may be corrupted or key is wrong"}`
    };
  }
}

/**
 * Encripta y retorna resultado o lanza error
 * Versión que lanza excepciones (para código más limpio)
 */
export function encryptOrThrow(plaintext: string, key: Buffer): EncryptedData {
  const result = encrypt(plaintext, key);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Encryption failed");
  }
  return result.data;
}

/**
 * Desencripta y retorna resultado o lanza error
 */
export function decryptOrThrow(encrypted: EncryptedData, key: Buffer): string {
  const result = decrypt(encrypted, key);
  if (!result.success || result.plaintext === undefined) {
    throw new Error(result.error || "Decryption failed");
  }
  return result.plaintext;
}
