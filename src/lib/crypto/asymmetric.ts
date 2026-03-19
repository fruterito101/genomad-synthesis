// src/lib/crypto/asymmetric.ts
// Encriptación asimétrica con ECDH (Elliptic Curve Diffie-Hellman)
// Curva secp256k1 - Compatible con Ethereum

import { createECDH, createHash, ECDH } from "crypto";
import { 
  KeyPair, 
  EncryptedData,
  EncryptionResult,
  DecryptionResult,
  CRYPTO_CONSTANTS 
} from "./types";
import { encrypt, decrypt, validateKey } from "./symmetric";

const { CURVE, KEY_LENGTH } = CRYPTO_CONSTANTS;

/**
 * Genera par de llaves ECDH con curva secp256k1
 * Compatible con wallets Ethereum
 * 
 * @returns Par de llaves (pública y privada en hex)
 * 
 * SEGURIDAD:
 * - La llave privada NUNCA debe exponerse
 * - La llave pública se puede compartir libremente
 */
export function generateKeyPair(): KeyPair {
  const ecdh = createECDH(CURVE);
  ecdh.generateKeys();

  return {
    publicKey: ecdh.getPublicKey("hex"),
    privateKey: ecdh.getPrivateKey("hex")
  };
}

/**
 * Valida formato de llave pública
 */
export function validatePublicKey(publicKey: string): boolean {
  try {
    // secp256k1 public keys son 65 bytes (uncompressed) = 130 hex chars
    // o 33 bytes (compressed) = 66 hex chars
    if (typeof publicKey !== "string") return false;
    if (!/^[0-9a-fA-F]+$/.test(publicKey)) return false;
    return publicKey.length === 130 || publicKey.length === 66;
  } catch {
    return false;
  }
}

/**
 * Valida formato de llave privada
 */
export function validatePrivateKey(privateKey: string): boolean {
  try {
    // secp256k1 private keys son 32 bytes = 64 hex chars
    if (typeof privateKey !== "string") return false;
    if (!/^[0-9a-fA-F]+$/.test(privateKey)) return false;
    return privateKey.length === 64;
  } catch {
    return false;
  }
}

/**
 * Deriva shared secret entre dos partes usando ECDH
 * 
 * Proceso:
 * 1. A tiene (privA, pubA), B tiene (privB, pubB)
 * 2. A computa: shared = ECDH(privA, pubB)
 * 3. B computa: shared = ECDH(privB, pubA)
 * 4. Ambos obtienen el mismo shared secret
 * 
 * @param myPrivateKey - Mi llave privada (hex)
 * @param theirPublicKey - Llave pública del otro (hex)
 * @returns Clave AES-256 derivada del shared secret
 */
export function deriveSharedSecret(
  myPrivateKey: string,
  theirPublicKey: string
): Buffer {
  // Validar inputs
  if (!validatePrivateKey(myPrivateKey)) {
    throw new Error("Invalid private key format");
  }
  if (!validatePublicKey(theirPublicKey)) {
    throw new Error("Invalid public key format");
  }

  // Crear ECDH con mi llave privada
  const ecdh = createECDH(CURVE);
  ecdh.setPrivateKey(Buffer.from(myPrivateKey, "hex"));

  // Computar shared secret
  const sharedSecret = ecdh.computeSecret(
    Buffer.from(theirPublicKey, "hex")
  );

  // Derivar clave AES-256 del shared secret usando SHA-256
  // Esto es KDF (Key Derivation Function) simple
  return createHash("sha256").update(sharedSecret).digest();
}

/**
 * Encripta datos para un destinatario específico
 * Solo el destinatario podrá desencriptar
 * 
 * @param data - Datos a encriptar
 * @param myPrivateKey - Mi llave privada
 * @param recipientPublicKey - Llave pública del destinatario
 * @returns Datos encriptados
 * 
 * FLUJO:
 * 1. Deriva shared secret con ECDH
 * 2. Usa shared secret como clave AES
 * 3. Encripta con AES-256-GCM
 */
export function encryptFor(
  data: string,
  myPrivateKey: string,
  recipientPublicKey: string
): EncryptionResult {
  try {
    const sharedKey = deriveSharedSecret(myPrivateKey, recipientPublicKey);
    
    if (!validateKey(sharedKey)) {
      return {
        success: false,
        error: "Failed to derive valid shared key"
      };
    }

    return encrypt(data, sharedKey);
  } catch (error) {
    return {
      success: false,
      error: `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

/**
 * Desencripta datos de un remitente específico
 * 
 * @param encrypted - Datos encriptados
 * @param myPrivateKey - Mi llave privada
 * @param senderPublicKey - Llave pública del remitente
 * @returns Datos desencriptados
 */
export function decryptFrom(
  encrypted: EncryptedData,
  myPrivateKey: string,
  senderPublicKey: string
): DecryptionResult {
  try {
    const sharedKey = deriveSharedSecret(myPrivateKey, senderPublicKey);
    
    if (!validateKey(sharedKey)) {
      return {
        success: false,
        error: "Failed to derive valid shared key"
      };
    }

    return decrypt(encrypted, sharedKey);
  } catch (error) {
    return {
      success: false,
      error: `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

/**
 * Versión que lanza excepciones
 */
export function encryptForOrThrow(
  data: string,
  myPrivateKey: string,
  recipientPublicKey: string
): EncryptedData {
  const result = encryptFor(data, myPrivateKey, recipientPublicKey);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Encryption failed");
  }
  return result.data;
}

/**
 * Versión que lanza excepciones
 */
export function decryptFromOrThrow(
  encrypted: EncryptedData,
  myPrivateKey: string,
  senderPublicKey: string
): string {
  const result = decryptFrom(encrypted, myPrivateKey, senderPublicKey);
  if (!result.success || result.plaintext === undefined) {
    throw new Error(result.error || "Decryption failed");
  }
  return result.plaintext;
}

/**
 * Encripta DNA para ambos padres
 * Cada padre recibe una copia que solo él puede desencriptar
 */
export function encryptDNAForParents(
  dnaJson: string,
  genomadPrivateKey: string,
  parentAPublicKey: string,
  parentBPublicKey: string
): {
  forParentA: EncryptedData;
  forParentB: EncryptedData;
} {
  const forA = encryptForOrThrow(dnaJson, genomadPrivateKey, parentAPublicKey);
  const forB = encryptForOrThrow(dnaJson, genomadPrivateKey, parentBPublicKey);

  return { forParentA: forA, forParentB: forB };
}
