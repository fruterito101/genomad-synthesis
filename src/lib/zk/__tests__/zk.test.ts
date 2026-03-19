// src/lib/zk/__tests__/zk.test.ts
// Tests for ZK proof generation

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateMockProof,
  generateTraitProof,
  generateBreedProof,
} from "../client";
import type { TraitProofRequest, BreedProofRequest } from "../client";
import { Traits } from "@/lib/genetic/types";

// Mock crypto for SSR environment
vi.mock("@/lib/genetic/types", () => ({
  TRAIT_NAMES: [
    "technical", "creativity", "social", "analysis",
    "empathy", "trading", "teaching", "leadership"
  ] as const,
}));

const testTraits: Traits = {
  technical: 75,
  creativity: 60,
  social: 70,
  analysis: 65,
  empathy: 55,
  trading: 80,
  teaching: 50,
  leadership: 85,
};

const parentA: Traits = {
  technical: 80, creativity: 60, social: 70, analysis: 75,
  empathy: 50, trading: 65, teaching: 55, leadership: 85,
};

const parentB: Traits = {
  technical: 40, creativity: 90, social: 30, analysis: 45,
  empathy: 80, trading: 35, teaching: 95, leadership: 25,
};

const validChild: Traits = {
  technical: 60, creativity: 75, social: 50, analysis: 60,
  empathy: 65, trading: 50, teaching: 75, leadership: 55,
};

describe("ZK Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateMockProof", () => {
    it("should generate mock trait proof", async () => {
      const request: TraitProofRequest = {
        type: "trait",
        traits: [75, 60, 70, 65, 55, 80, 50, 85],
        salt: "0".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const result = await generateMockProof(request);

      expect(result.success).toBe(true);
      expect(result.proof).toBeDefined();
      expect(result.proof?.seal).toBeDefined();
      expect(result.proof?.journal).toBeDefined();
      expect(result.output?.valid).toBe(true);
    });

    it("should generate mock breed proof", async () => {
      const request: BreedProofRequest = {
        type: "breed",
        parentA: [80, 60, 70, 75, 50, 65, 55, 85],
        parentB: [40, 90, 30, 45, 80, 35, 95, 25],
        child: [60, 75, 50, 60, 65, 50, 75, 55],
        crossoverMask: [true, false, true, false, true, false, true, false],
        maxMutation: 10,
        randomSeed: "12345678",
      };

      const result = await generateMockProof(request);

      expect(result.success).toBe(true);
      expect(result.proof).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.output?.mutations).toBeDefined();
      expect(Array.isArray(result.output?.mutations)).toBe(true);
    });

    it("should calculate fitness from traits", async () => {
      const request: TraitProofRequest = {
        type: "trait",
        traits: [50, 50, 50, 50, 50, 50, 50, 50], // total = 400
        salt: "0".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const result = await generateMockProof(request);

      expect(result.output?.fitness).toBe(400);
    });

    it("should detect hybrid vigor", async () => {
      // Child has higher fitness than both parents
      const request: BreedProofRequest = {
        type: "breed",
        parentA: [50, 50, 50, 50, 50, 50, 50, 50], // 400
        parentB: [50, 50, 50, 50, 50, 50, 50, 50], // 400
        child: [60, 60, 60, 60, 60, 60, 60, 60],   // 480 > 400
        crossoverMask: [true, true, true, true, true, true, true, true],
        maxMutation: 15,
        randomSeed: "12345678",
      };

      const result = await generateMockProof(request);

      expect(result.output?.hybridVigor).toBe(true);
    });

    it("should assign rarity based on fitness", async () => {
      // High fitness = higher rarity
      const highFitness: TraitProofRequest = {
        type: "trait",
        traits: [95, 95, 95, 95, 95, 95, 95, 95], // 760 -> rarity 5
        salt: "0".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const lowFitness: TraitProofRequest = {
        type: "trait",
        traits: [30, 30, 30, 30, 30, 30, 30, 30], // 240 -> rarity 2
        salt: "0".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const high = await generateMockProof(highFitness);
      const low = await generateMockProof(lowFitness);

      expect(high.output?.rarity).toBe(5);
      expect(low.output?.rarity).toBe(2);
    });

    it("should include cycle count and proof time", async () => {
      const request: TraitProofRequest = {
        type: "trait",
        traits: [50, 50, 50, 50, 50, 50, 50, 50],
        salt: "0".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const result = await generateMockProof(request);

      expect(result.cycleCount).toBeDefined();
      expect(result.proofTimeMs).toBeDefined();
      expect(typeof result.cycleCount).toBe("number");
      expect(typeof result.proofTimeMs).toBe("number");
    });
  });

  describe("Proof Structure", () => {
    it("should return valid proof structure", async () => {
      const request: TraitProofRequest = {
        type: "trait",
        traits: [50, 50, 50, 50, 50, 50, 50, 50],
        salt: "0".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const result = await generateMockProof(request);

      // Seal should be hex string
      expect(result.proof?.seal).toMatch(/^0x[a-f0-9]+$/);
      
      // Journal should be hex string
      expect(result.proof?.journal).toMatch(/^0x[a-f0-9]+$/);
      
      // ImageId should be hex string
      expect(result.proof?.imageId).toMatch(/^0x[a-f0-9]+$/);
    });

    it("should have consistent imageId", async () => {
      const request1: TraitProofRequest = {
        type: "trait",
        traits: [50, 50, 50, 50, 50, 50, 50, 50],
        salt: "a".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const request2: TraitProofRequest = {
        type: "trait",
        traits: [60, 60, 60, 60, 60, 60, 60, 60],
        salt: "b".repeat(64),
        expectedCommitment: "0".repeat(64),
      };

      const result1 = await generateMockProof(request1);
      const result2 = await generateMockProof(request2);

      // Same proof type should have same imageId
      expect(result1.proof?.imageId).toBe(result2.proof?.imageId);
    });
  });

  describe("Validation", () => {
    it("should validate mutations within bounds", async () => {
      const validRequest: BreedProofRequest = {
        type: "breed",
        parentA: [50, 50, 50, 50, 50, 50, 50, 50],
        parentB: [50, 50, 50, 50, 50, 50, 50, 50],
        child: [55, 55, 55, 55, 55, 55, 55, 55], // +5 mutation
        crossoverMask: [true, true, true, true, true, true, true, true],
        maxMutation: 10,
        randomSeed: "12345678",
      };

      const result = await generateMockProof(validRequest);

      expect(result.output?.valid).toBe(true);
    });

    it("should detect invalid mutations", async () => {
      const invalidRequest: BreedProofRequest = {
        type: "breed",
        parentA: [50, 50, 50, 50, 50, 50, 50, 50],
        parentB: [50, 50, 50, 50, 50, 50, 50, 50],
        child: [80, 50, 50, 50, 50, 50, 50, 50], // +30 mutation on first trait
        crossoverMask: [true, true, true, true, true, true, true, true],
        maxMutation: 10, // Only 10 allowed
        randomSeed: "12345678",
      };

      const result = await generateMockProof(invalidRequest);

      expect(result.output?.valid).toBe(false);
    });
  });
});
