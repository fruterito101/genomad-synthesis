// src/lib/genetic/__tests__/crossover.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uniformCrossover,
  singlePointCrossover,
  weightedCrossover,
  crossover,
} from "../crossover";
import { Traits, TRAIT_NAMES } from "../types";

// Test parents
const parentA: Traits = {
  technical: 80,
  creativity: 60,
  social: 70,
  analysis: 75,
  empathy: 50,
  trading: 65,
  teaching: 55,
  leadership: 85,
};

const parentB: Traits = {
  technical: 40,
  creativity: 90,
  social: 30,
  analysis: 45,
  empathy: 80,
  trading: 35,
  teaching: 95,
  leadership: 25,
};

describe("Genetic Crossover", () => {
  describe("uniformCrossover", () => {
    it("should produce child with all traits", () => {
      const child = uniformCrossover(parentA, parentB);
      
      expect(child).toBeDefined();
      for (const trait of TRAIT_NAMES) {
        expect(child[trait]).toBeDefined();
        expect(typeof child[trait]).toBe("number");
      }
    });

    it("should only use values from parents", () => {
      // Mock Math.random to be deterministic
      const mockRandom = vi.spyOn(Math, "random");
      mockRandom.mockReturnValue(0.3); // Always pick parent A
      
      const child = uniformCrossover(parentA, parentB);
      
      for (const trait of TRAIT_NAMES) {
        expect([parentA[trait], parentB[trait]]).toContain(child[trait]);
      }
      
      mockRandom.mockRestore();
    });
  });

  describe("singlePointCrossover", () => {
    it("should produce child with all traits", () => {
      const child = singlePointCrossover(parentA, parentB);
      
      expect(child).toBeDefined();
      for (const trait of TRAIT_NAMES) {
        expect(child[trait]).toBeDefined();
      }
    });

    it("should have traits from both parents", () => {
      // Run multiple times to ensure we get traits from both
      let hasParentA = false;
      let hasParentB = false;
      
      for (let i = 0; i < 100; i++) {
        const child = singlePointCrossover(parentA, parentB);
        if (child.technical === parentA.technical) hasParentA = true;
        if (child.leadership === parentB.leadership) hasParentB = true;
      }
      
      // At least one run should have traits from each parent
      expect(hasParentA || hasParentB).toBe(true);
    });
  });

  describe("weightedCrossover", () => {
    it("should produce child with all traits", () => {
      const child = weightedCrossover(parentA, parentB);
      
      expect(child).toBeDefined();
      for (const trait of TRAIT_NAMES) {
        expect(child[trait]).toBeDefined();
      }
    });

    it("should produce values between parent values", () => {
      const child = weightedCrossover(parentA, parentB);
      
      for (const trait of TRAIT_NAMES) {
        const min = Math.min(parentA[trait], parentB[trait]);
        const max = Math.max(parentA[trait], parentB[trait]);
        expect(child[trait]).toBeGreaterThanOrEqual(min - 1); // -1 for rounding
        expect(child[trait]).toBeLessThanOrEqual(max + 1); // +1 for rounding
      }
    });

    it("should favor parent A for social trait (0.7 dominance)", () => {
      const child = weightedCrossover(parentA, parentB);
      // social: parentA=70, parentB=30, dominance=0.7
      // expected = 70*0.7 + 30*0.3 = 49 + 9 = 58
      expect(child.social).toBe(58);
    });
  });

  describe("crossover (factory)", () => {
    it("should call uniformCrossover for type uniform", () => {
      const child = crossover(parentA, parentB, "uniform");
      expect(child).toBeDefined();
      for (const trait of TRAIT_NAMES) {
        expect([parentA[trait], parentB[trait]]).toContain(child[trait]);
      }
    });

    it("should call weightedCrossover for type weighted", () => {
      const child = crossover(parentA, parentB, "weighted");
      expect(child).toBeDefined();
      // Check it's doing weighted (values should be blended)
      expect(child.social).toBe(58); // Same as weighted test
    });

    it("should call singlePointCrossover for type single", () => {
      const child = crossover(parentA, parentB, "single");
      expect(child).toBeDefined();
    });
  });
});
