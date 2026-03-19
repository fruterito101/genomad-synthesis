// src/lib/heuristics/dna-hash.ts
// Calcula el HASH REAL del DNA

import { createHash } from "crypto";
import { Traits, TRAIT_NAMES } from "@/lib/genetic/types";

/**
 * Calcula hash SHA256 determinístico de los traits
 */
export function calculateTraitsHash(traits: Traits): string {
  // Ordenar traits alfabéticamente para hash determinístico
  const sortedTraits = TRAIT_NAMES
    .slice()
    .sort()
    .map(name => `${name}:${traits[name]}`)
    .join("|");
  
  return createHash("sha256")
    .update(sortedTraits)
    .digest("hex");
}

/**
 * Hash corto para display (primeros N caracteres con 0x)
 */
export function shortHash(hash: string, length: number = 16): string {
  return `0x${hash.slice(0, length)}`;
}

/**
 * Genera DNA hash completo con metadata
 */
export function generateDNAHash(
  traits: Traits,
  generation: number = 0,
  timestamp?: number
): {
  fullHash: string;
  shortHash: string;
  commitment: string;
} {
  const ts = timestamp || Date.now();
  
  // Hash de traits
  const traitsHash = calculateTraitsHash(traits);
  
  // Commitment incluye generation y timestamp
  const commitmentData = `${traitsHash}|gen:${generation}|ts:${ts}`;
  const commitment = createHash("sha256")
    .update(commitmentData)
    .digest("hex");
  
  return {
    fullHash: traitsHash,
    shortHash: shortHash(traitsHash),
    commitment: shortHash(commitment, 12)
  };
}

/**
 * Verifica si dos sets de traits producen el mismo hash
 */
export function verifyTraitsMatch(traits1: Traits, traits2: Traits): boolean {
  return calculateTraitsHash(traits1) === calculateTraitsHash(traits2);
}
