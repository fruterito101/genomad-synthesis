// src/lib/crypto/index.ts
// Exports del módulo de criptografía de Genomad

// ============================================
// Types
// ============================================
export type {
  EncryptedData,
  KeyPair,
  Commitment,
  SignedMessage,
  EncryptedDNA,
  EncryptionResult,
  DecryptionResult,
  VerificationResult,
} from "./types";

export { CRYPTO_CONSTANTS } from "./types";

// ============================================
// Symmetric Encryption (AES-256-GCM)
// ============================================
export {
  generateSymmetricKey,
  validateKey,
  encrypt,
  decrypt,
  encryptOrThrow,
  decryptOrThrow,
} from "./symmetric";

// ============================================
// Asymmetric Encryption (ECDH + secp256k1)
// ============================================
export {
  generateKeyPair,
  validatePublicKey,
  validatePrivateKey,
  deriveSharedSecret,
  encryptFor,
  decryptFrom,
  encryptForOrThrow,
  decryptFromOrThrow,
  encryptDNAForParents,
} from "./asymmetric";

// ============================================
// Commitment Schemes (Commit-Reveal)
// ============================================
export {
  createCommitment,
  verifyCommitment,
  serializeTraits,
  createDNACommitment,
  verifyDNACommitment,
  createBreedingCommitment,
  verifyBreedingCommitment,
  getCommitmentHash,
  prepareReveal,
} from "./commitment";

// ============================================
// Digital Signatures (ECDSA)
// ============================================
export {
  signMessage,
  verifySignature,
  createSignedMessage,
  verifySignedMessage,
  signDNAOwnership,
  verifyDNAOwnership,
} from "./signatures";

// ============================================
// Utilities
// ============================================
export {
  randomHex,
  generateNonce,
  sha256,
  sha256Hex,
  sha3_256,
  hexToBytes,
  bytesToHex,
  bytesToHexRaw,
  secureCompare,
  secureCompareHex,
  generateUniqueId,
  truncateHash,
  isValidHash,
  isValidSha256,
  toBase64Url,
  fromBase64Url,
} from "./utils";
