// src/lib/crypto/commitment.ts
// Esquemas de Commitment (Commit-Reveal)
// Para publicar valores on-chain sin revelarlos

import { randomBytes, createHash } from "crypto";
import { Commitment } from "./types";
import { Traits, TRAIT_NAMES } from "@/lib/genetic/types";

/**
 * Tamaño del nonce en bytes (256 bits = 32 bytes)
 * Suficiente entropía para prevenir fuerza bruta
 */
const NONCE_LENGTH = 32;

/**
 * Crea un commitment de un valor arbitrario
 * 
 * ESQUEMA:
 * 1. Genera nonce random
 * 2. Calcula hash = SHA256(value || nonce)
 * 3. Publica hash (nadie sabe el valor)
 * 4. Luego revela value + nonce
 * 5. Verificador computa SHA256(value || nonce) y compara
 * 
 * PROPIEDADES:
 * - Hiding: hash no revela el valor
 * - Binding: no puedes cambiar el valor después
 * 
 * @param value - Valor a comprometer
 * @returns Commitment (hash + nonce)
 */
export function createCommitment(value: string): Commitment {
  // Validar input
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }

  // Generar nonce criptográficamente seguro
  const nonce = randomBytes(NONCE_LENGTH).toString("hex");

  // Calcular hash = SHA256(value || nonce)
  // Usamos || como separador para evitar ataques de length extension
  const hash = createHash("sha256")
    .update(value)
    .update("||") // Separador explícito
    .update(nonce)
    .digest("hex");

  return { hash, nonce };
}

/**
 * Verifica que un valor corresponde a un commitment
 * 
 * @param value - Valor revelado
 * @param commitment - Commitment original
 * @returns true si el valor es correcto
 */
export function verifyCommitment(
  value: string,
  commitment: Commitment
): boolean {
  try {
    // Validar inputs
    if (typeof value !== "string") return false;
    if (!commitment.hash || !commitment.nonce) return false;

    // Recalcular hash
    const computedHash = createHash("sha256")
      .update(value)
      .update("||")
      .update(commitment.nonce)
      .digest("hex");

    // Comparar (timing-safe no es crítico aquí, pero buena práctica)
    return computedHash === commitment.hash;
  } catch {
    return false;
  }
}

/**
 * Serializa traits de forma determinística
 * IMPORTANTE: El orden debe ser siempre el mismo para que el hash sea reproducible
 */
export function serializeTraits(traits: Traits): string {
  // Ordenar alfabéticamente y crear string determinístico
  return TRAIT_NAMES
    .slice() // Copia para no mutar
    .sort()
    .map(name => `${name}:${traits[name]}`)
    .join("|");
}

/**
 * Crea commitment específico para DNA traits
 * 
 * @param traits - Objeto de traits del agente
 * @returns Commitment del DNA
 */
export function createDNACommitment(traits: Traits): Commitment {
  // Validar que todos los traits existen y son números válidos
  for (const name of TRAIT_NAMES) {
    const value = traits[name];
    if (typeof value !== "number" || value < 0 || value > 100) {
      throw new Error(`Invalid trait ${name}: must be number 0-100, got ${value}`);
    }
  }

  const traitsString = serializeTraits(traits);
  return createCommitment(traitsString);
}

/**
 * Verifica DNA commitment
 * 
 * @param traits - Traits revelados
 * @param commitment - Commitment original
 * @returns true si los traits corresponden al commitment
 */
export function verifyDNACommitment(
  traits: Traits,
  commitment: Commitment
): boolean {
  try {
    const traitsString = serializeTraits(traits);
    return verifyCommitment(traitsString, commitment);
  } catch {
    return false;
  }
}

/**
 * Crea commitment para breeding
 * Incluye ambos parents y el seed
 * 
 * @param parentAHash - Hash del DNA del parent A
 * @param parentBHash - Hash del DNA del parent B
 * @param seed - Seed random para el breeding
 * @returns Commitment del breeding
 */
export function createBreedingCommitment(
  parentAHash: string,
  parentBHash: string,
  seed: string
): Commitment {
  // Ordenar hashes para que el orden no importe
  const sortedHashes = [parentAHash, parentBHash].sort().join("|");
  const value = `${sortedHashes}|seed:${seed}`;
  return createCommitment(value);
}

/**
 * Verifica breeding commitment
 */
export function verifyBreedingCommitment(
  parentAHash: string,
  parentBHash: string,
  seed: string,
  commitment: Commitment
): boolean {
  const sortedHashes = [parentAHash, parentBHash].sort().join("|");
  const value = `${sortedHashes}|seed:${seed}`;
  return verifyCommitment(value, commitment);
}

/**
 * Genera hash del commitment para almacenar on-chain
 * (Solo el hash, no el nonce - el nonce es secreto hasta el reveal)
 */
export function getCommitmentHash(commitment: Commitment): string {
  return commitment.hash;
}

/**
 * Prepara datos para reveal on-chain
 */
export function prepareReveal(commitment: Commitment): {
  nonce: string;
  hash: string;
} {
  return {
    nonce: commitment.nonce,
    hash: commitment.hash
  };
}
