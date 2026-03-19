// src/lib/genetic/hash.ts

import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { AgentDNA, TRAIT_NAMES } from "./types";

export function calculateDNAHash(dna: Omit<AgentDNA, "hash">): string {
  const data = {
    traits: Object.fromEntries(
      TRAIT_NAMES.map((t) => [t, dna.traits[t]])
    ),
    generation: dna.generation,
    lineage: [...dna.lineage].sort(),
  };

  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  return bytesToHex(sha256(encoder.encode(json)));
}

export function verifyDNAHash(dna: AgentDNA): boolean {
  const { hash, ...rest } = dna;
  return hash === calculateDNAHash(rest);
}

export function shortHash(hash: string, length = 8): string {
  return hash.slice(0, length);
}

export function calculateCommitment(dna: AgentDNA): string {
  const traitsBytes = new Uint8Array(TRAIT_NAMES.map((t) => dna.traits[t]));
  const genByte = new Uint8Array([dna.generation]);
  return bytesToHex(sha256(new Uint8Array([...traitsBytes, ...genByte])));
}
