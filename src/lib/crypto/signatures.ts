// src/lib/crypto/signatures.ts
// Firmas digitales ECDSA con secp256k1
// Compatible con Ethereum

import { 
  createSign, 
  createVerify, 
  createHash,
  createECDH,
  sign as cryptoSign,
  verify as cryptoVerify
} from "crypto";
import { SignedMessage, VerificationResult, CRYPTO_CONSTANTS } from "./types";
import { validatePublicKey, validatePrivateKey } from "./asymmetric";

const { CURVE } = CRYPTO_CONSTANTS;

/**
 * Calcula hash del mensaje (preparación para firma)
 * Usamos SHA256 como es estándar
 */
function hashMessage(message: string): Buffer {
  return createHash("sha256").update(message).digest();
}

/**
 * Firma un mensaje con llave privada ECDSA
 * 
 * @param message - Mensaje a firmar
 * @param privateKey - Llave privada (hex)
 * @returns Firma (hex)
 * 
 * NOTA: Esta es una implementación simplificada.
 * Para producción, considerar usar ethers.js o viem para 
 * compatibilidad total con Ethereum signatures (v, r, s format)
 */
export function signMessage(
  message: string,
  privateKey: string
): string {
  // Validar inputs
  if (typeof message !== "string") {
    throw new Error("Message must be a string");
  }
  if (!validatePrivateKey(privateKey)) {
    throw new Error("Invalid private key format");
  }

  // Hash del mensaje
  const messageHash = hashMessage(message);

  // Para secp256k1, necesitamos usar el módulo crypto de forma especial
  // Creamos ECDH para acceder a la curva, luego firmamos
  const ecdh = createECDH(CURVE);
  ecdh.setPrivateKey(Buffer.from(privateKey, "hex"));

  // Crear firma usando el hash
  // Usamos createSign con EC
  const signer = createSign("SHA256");
  signer.update(message);
  
  // Convertir private key a formato PEM para Node crypto
  const privateKeyPem = convertPrivateKeyToPem(privateKey);
  
  const signature = signer.sign({
    key: privateKeyPem,
    dsaEncoding: "ieee-p1363" // Formato más compacto
  }, "hex");

  return signature;
}

/**
 * Verifica una firma
 * 
 * @param message - Mensaje original
 * @param signature - Firma (hex)
 * @param publicKey - Llave pública del firmante (hex)
 * @returns true si la firma es válida
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    // Validar inputs
    if (typeof message !== "string") return false;
    if (typeof signature !== "string") return false;
    if (!validatePublicKey(publicKey)) return false;

    // Convertir public key a formato PEM
    const publicKeyPem = convertPublicKeyToPem(publicKey);

    const verifier = createVerify("SHA256");
    verifier.update(message);

    return verifier.verify({
      key: publicKeyPem,
      dsaEncoding: "ieee-p1363"
    }, signature, "hex");
  } catch {
    return false;
  }
}

/**
 * Crea un mensaje firmado completo
 */
export function createSignedMessage(
  message: string,
  privateKey: string
): SignedMessage {
  // Derivar public key de private key
  const ecdh = createECDH(CURVE);
  ecdh.setPrivateKey(Buffer.from(privateKey, "hex"));
  const publicKey = ecdh.getPublicKey("hex");

  const signature = signMessage(message, privateKey);
  const timestamp = Date.now();

  return {
    message,
    signature,
    publicKey,
    timestamp
  };
}

/**
 * Verifica un mensaje firmado completo
 */
export function verifySignedMessage(signed: SignedMessage): VerificationResult {
  try {
    // Validar estructura
    if (!signed.message || !signed.signature || !signed.publicKey) {
      return {
        valid: false,
        error: "Invalid signed message structure"
      };
    }

    // Verificar firma
    const valid = verifySignature(signed.message, signed.signature, signed.publicKey);

    if (!valid) {
      return {
        valid: false,
        error: "Signature verification failed"
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Verification error: ${error instanceof Error ? error.message : "Unknown"}`
    };
  }
}

/**
 * Firma un hash de DNA para probar ownership
 */
export function signDNAOwnership(
  dnaHash: string,
  ownerPrivateKey: string,
  tokenId?: string
): SignedMessage {
  const message = tokenId 
    ? `I own DNA ${dnaHash} with token ${tokenId}`
    : `I own DNA ${dnaHash}`;
  
  return createSignedMessage(message, ownerPrivateKey);
}

/**
 * Verifica firma de ownership de DNA
 */
export function verifyDNAOwnership(
  dnaHash: string,
  signature: SignedMessage,
  tokenId?: string
): VerificationResult {
  const expectedMessage = tokenId
    ? `I own DNA ${dnaHash} with token ${tokenId}`
    : `I own DNA ${dnaHash}`;

  if (signature.message !== expectedMessage) {
    return {
      valid: false,
      error: "Message does not match expected format"
    };
  }

  return verifySignedMessage(signature);
}

// ============================================
// Helpers para conversión de formato de llaves
// ============================================

/**
 * Convierte private key hex a formato PEM
 * Necesario para Node.js crypto module
 */
function convertPrivateKeyToPem(privateKeyHex: string): string {
  // EC private key en formato SEC1/DER
  const privateKeyBuffer = Buffer.from(privateKeyHex, "hex");
  
  // Crear estructura ASN.1 para EC private key
  // OID para secp256k1: 1.3.132.0.10
  const oid = Buffer.from("06052b8104000a", "hex"); // secp256k1 OID
  
  // Simplified: usar formato raw para Node.js
  // En producción, usar una librería como 'elliptic' o 'secp256k1'
  const der = Buffer.concat([
    Buffer.from("30740201010420", "hex"),
    privateKeyBuffer,
    Buffer.from("a007", "hex"),
    oid,
    Buffer.from("a144034200", "hex"),
    derivePublicKeyFromPrivate(privateKeyHex)
  ]);

  const base64 = der.toString("base64");
  const pem = `-----BEGIN EC PRIVATE KEY-----\n${base64.match(/.{1,64}/g)?.join("\n")}\n-----END EC PRIVATE KEY-----`;
  
  return pem;
}

/**
 * Convierte public key hex a formato PEM
 */
function convertPublicKeyToPem(publicKeyHex: string): string {
  const publicKeyBuffer = Buffer.from(publicKeyHex, "hex");
  
  // EC public key en formato SubjectPublicKeyInfo
  const oid = Buffer.from("06052b8104000a", "hex"); // secp256k1 OID
  const algorithmId = Buffer.from("3016", "hex");
  
  const der = Buffer.concat([
    Buffer.from("3056301006072a8648ce3d020106052b8104000a034200", "hex"),
    publicKeyBuffer
  ]);

  const base64 = der.toString("base64");
  const pem = `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
  
  return pem;
}

/**
 * Deriva public key de private key
 */
function derivePublicKeyFromPrivate(privateKeyHex: string): Buffer {
  const ecdh = createECDH(CURVE);
  ecdh.setPrivateKey(Buffer.from(privateKeyHex, "hex"));
  return ecdh.getPublicKey();
}
