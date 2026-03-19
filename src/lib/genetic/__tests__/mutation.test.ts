// src/lib/genetic/__tests__/mutation.test.ts
import { describe, it, expect, vi } from "vitest";
import { applyMutation, countMutations } from "../mutation";
import { Traits, TRAIT_NAMES } from "../types";

const baseTraits: Traits = {
  technical: 50,
  creativity: 50,
  social: 50,
  analysis: 50,
  empathy: 50,
  trading: 50,
  teaching: 50,
  leadership: 50,
};

describe("Genetic Mutation", () => {
  describe("applyMutation", () => {
    it("should return traits object and mutation count", () => {
      const result = applyMutation(baseTraits, 0.5);
      
      expect(result).toHaveProperty("traits");
      expect(result).toHaveProperty("mutationsApplied");
      expect(typeof result.mutationsApplied).toBe("number");
    });

    it("should keep traits within 0-100 range", () => {
      // Test with extreme values
      const extremeTraits: Traits = {
        technical: 0,
        creativity: 100,
        social: 5,
        analysis: 95,
        empathy: 0,
        trading: 100,
        teaching: 10,
        leadership: 90,
      };
      
      // Run multiple times with high mutation rate
      for (let i = 0; i < 50; i++) {
        const result = applyMutation(extremeTraits, 1.0, 30);
        
        for (const trait of TRAIT_NAMES) {
          expect(result.traits[trait]).toBeGreaterThanOrEqual(0);
          expect(result.traits[trait]).toBeLessThanOrEqual(100);
        }
      }
    });

    it("should not mutate when mutation rate is 0", () => {
      const result = applyMutation(baseTraits, 0);
      
      expect(result.mutationsApplied).toBe(0);
      for (const trait of TRAIT_NAMES) {
        expect(result.traits[trait]).toBe(baseTraits[trait]);
      }
    });

    it("should mutate all traits when mutation rate is 1", () => {
      // Mock Math.random to control gaussian
      const mockRandom = vi.spyOn(Math, "random");
      mockRandom.mockReturnValue(0.5);
      
      const result = applyMutation(baseTraits, 1.0, 10);
      
      // With rate 1.0, all 8 traits should potentially mutate
      expect(result.mutationsApplied).toBe(8);
      
      mockRandom.mockRestore();
    });

    it("should not modify original traits object", () => {
      const original = { ...baseTraits };
      applyMutation(baseTraits, 1.0);
      
      for (const trait of TRAIT_NAMES) {
        expect(baseTraits[trait]).toBe(original[trait]);
      }
    });
  });

  describe("countMutations", () => {
    it("should return 0 when child matches average of parents", () => {
      const parentA: Traits = {
        technical: 60, creativity: 60, social: 60, analysis: 60,
        empathy: 60, trading: 60, teaching: 60, leadership: 60,
      };
      const parentB: Traits = {
        technical: 40, creativity: 40, social: 40, analysis: 40,
        empathy: 40, trading: 40, teaching: 40, leadership: 40,
      };
      const child: Traits = {
        technical: 50, creativity: 50, social: 50, analysis: 50,
        empathy: 50, trading: 50, teaching: 50, leadership: 50,
      };
      
      const count = countMutations(parentA, parentB, child);
      expect(count).toBe(0);
    });

    it("should count traits that deviate significantly", () => {
      const parentA: Traits = {
        technical: 50, creativity: 50, social: 50, analysis: 50,
        empathy: 50, trading: 50, teaching: 50, leadership: 50,
      };
      const parentB: Traits = {
        technical: 50, creativity: 50, social: 50, analysis: 50,
        empathy: 50, trading: 50, teaching: 50, leadership: 50,
      };
      // Child has one trait that deviates by more than threshold (5)
      const child: Traits = {
        technical: 70, // +20 from expected 50
        creativity: 50,
        social: 50,
        analysis: 50,
        empathy: 50,
        trading: 50,
        teaching: 50,
        leadership: 50,
      };
      
      const count = countMutations(parentA, parentB, child, 5);
      expect(count).toBe(1);
    });

    it("should use custom threshold", () => {
      const parentA = baseTraits;
      const parentB = baseTraits;
      const child: Traits = {
        ...baseTraits,
        technical: 55, // +5 from expected
      };
      
      // With threshold 10, this shouldn't count as mutation
      expect(countMutations(parentA, parentB, child, 10)).toBe(0);
      
      // With threshold 4, this should count
      expect(countMutations(parentA, parentB, child, 4)).toBe(1);
    });
  });
});
