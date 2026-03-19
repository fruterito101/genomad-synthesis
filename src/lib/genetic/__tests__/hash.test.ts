// src/lib/genetic/__tests__/hash.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateDNAHash,
  verifyDNAHash,
  shortHash,
  calculateCommitment,
} from "../hash";
import { AgentDNA, Traits } from "../types";

const testTraits: Traits = {
  technical: 75,
  creativity: 60,
  social: 80,
  analysis: 70,
  empathy: 55,
  trading: 65,
  teaching: 50,
  leadership: 85,
};

const testDnaBase = {
  name: "TestAgent",
  traits: testTraits,
  generation: 1,
  lineage: ["parent1", "parent2"],
  mutations: 2,
};

describe("DNA Hashing", () => {
  describe("calculateDNAHash", () => {
    it("should return a hex string", () => {
      const hash = calculateDNAHash(testDnaBase);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).toMatch(/^[a-f0-9]+$/); // hex characters only
    });

    it("should return 64 character hash (SHA256)", () => {
      const hash = calculateDNAHash(testDnaBase);
      expect(hash.length).toBe(64);
    });

    it("should be deterministic (same input = same output)", () => {
      const hash1 = calculateDNAHash(testDnaBase);
      const hash2 = calculateDNAHash(testDnaBase);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hash for different traits", () => {
      const differentTraits = {
        ...testDnaBase,
        traits: { ...testTraits, technical: 76 }, // +1 difference
      };
      
      const hash1 = calculateDNAHash(testDnaBase);
      const hash2 = calculateDNAHash(differentTraits);
      
      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hash for different generation", () => {
      const differentGen = {
        ...testDnaBase,
        generation: 2,
      };
      
      const hash1 = calculateDNAHash(testDnaBase);
      const hash2 = calculateDNAHash(differentGen);
      
      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty lineage", () => {
      const noLineage = {
        ...testDnaBase,
        lineage: [],
      };
      
      const hash = calculateDNAHash(noLineage);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  describe("verifyDNAHash", () => {
    it("should return true for valid DNA", () => {
      const hash = calculateDNAHash(testDnaBase);
      const dna: AgentDNA = { ...testDnaBase, hash };
      
      expect(verifyDNAHash(dna)).toBe(true);
    });

    it("should return false for tampered DNA", () => {
      const hash = calculateDNAHash(testDnaBase);
      const tamperedDna: AgentDNA = {
        ...testDnaBase,
        hash,
        traits: { ...testTraits, technical: 99 }, // tampered
      };
      
      expect(verifyDNAHash(tamperedDna)).toBe(false);
    });

    it("should return false for wrong hash", () => {
      const dna: AgentDNA = {
        ...testDnaBase,
        hash: "0".repeat(64), // fake hash
      };
      
      expect(verifyDNAHash(dna)).toBe(false);
    });
  });

  describe("shortHash", () => {
    it("should return first 8 characters by default", () => {
      const hash = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const short = shortHash(hash);
      
      expect(short).toBe("abcdef12");
      expect(short.length).toBe(8);
    });

    it("should return custom length", () => {
      const hash = "abcdef1234567890";
      
      expect(shortHash(hash, 4)).toBe("abcd");
      expect(shortHash(hash, 12)).toBe("abcdef123456");
    });

    it("should handle hash shorter than length", () => {
      const hash = "abc";
      expect(shortHash(hash, 10)).toBe("abc");
    });
  });

  describe("calculateCommitment", () => {
    it("should return a hex string", () => {
      const hash = calculateDNAHash(testDnaBase);
      const dna: AgentDNA = { ...testDnaBase, hash };
      const commitment = calculateCommitment(dna);
      
      expect(commitment).toBeDefined();
      expect(typeof commitment).toBe("string");
      expect(commitment).toMatch(/^[a-f0-9]+$/);
    });

    it("should return 64 character commitment", () => {
      const hash = calculateDNAHash(testDnaBase);
      const dna: AgentDNA = { ...testDnaBase, hash };
      const commitment = calculateCommitment(dna);
      
      expect(commitment.length).toBe(64);
    });

    it("should be deterministic", () => {
      const hash = calculateDNAHash(testDnaBase);
      const dna: AgentDNA = { ...testDnaBase, hash };
      
      const commitment1 = calculateCommitment(dna);
      const commitment2 = calculateCommitment(dna);
      
      expect(commitment1).toBe(commitment2);
    });

    it("should differ from DNA hash", () => {
      const hash = calculateDNAHash(testDnaBase);
      const dna: AgentDNA = { ...testDnaBase, hash };
      const commitment = calculateCommitment(dna);
      
      // Commitment uses different data format, should be different
      expect(commitment).not.toBe(hash);
    });
  });
});
