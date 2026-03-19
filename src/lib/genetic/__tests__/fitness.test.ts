// src/lib/genetic/__tests__/fitness.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateFitness,
  calculateSynergyBonus,
  calculateTotalFitness,
  FITNESS_PRESETS,
} from "../fitness";
import { Traits, TRAIT_NAMES } from "../types";

const averageTraits: Traits = {
  technical: 50,
  creativity: 50,
  social: 50,
  analysis: 50,
  empathy: 50,
  trading: 50,
  teaching: 50,
  leadership: 50,
};

const highTraits: Traits = {
  technical: 90,
  creativity: 90,
  social: 90,
  analysis: 90,
  empathy: 90,
  trading: 90,
  teaching: 90,
  leadership: 90,
};

const lowTraits: Traits = {
  technical: 10,
  creativity: 10,
  social: 10,
  analysis: 10,
  empathy: 10,
  trading: 10,
  teaching: 10,
  leadership: 10,
};

describe("Fitness Calculation", () => {
  describe("calculateFitness", () => {
    it("should return ~50 for average traits with default weights", () => {
      const fitness = calculateFitness(averageTraits);
      expect(fitness).toBeCloseTo(50, 0);
    });

    it("should return ~90 for high traits", () => {
      const fitness = calculateFitness(highTraits);
      expect(fitness).toBeCloseTo(90, 0);
    });

    it("should return ~10 for low traits", () => {
      const fitness = calculateFitness(lowTraits);
      expect(fitness).toBeCloseTo(10, 0);
    });

    it("should be between 0 and 100", () => {
      const allZero: Traits = {
        technical: 0, creativity: 0, social: 0, analysis: 0,
        empathy: 0, trading: 0, teaching: 0, leadership: 0,
      };
      const allHundred: Traits = {
        technical: 100, creativity: 100, social: 100, analysis: 100,
        empathy: 100, trading: 100, teaching: 100, leadership: 100,
      };
      
      expect(calculateFitness(allZero)).toBe(0);
      expect(calculateFitness(allHundred)).toBe(100);
    });

    it("should apply custom weights", () => {
      const techHeavy: Traits = {
        technical: 100,
        creativity: 0, social: 0, analysis: 0,
        empathy: 0, trading: 0, teaching: 0, leadership: 0,
      };
      
      // With high weight on technical
      const highTechWeight = calculateFitness(techHeavy, { technical: 10.0 });
      const normalWeight = calculateFitness(techHeavy);
      
      expect(highTechWeight).toBeGreaterThan(normalWeight);
    });
  });

  describe("calculateSynergyBonus", () => {
    it("should return 0 for low traits (no synergy threshold met)", () => {
      const bonus = calculateSynergyBonus(lowTraits);
      expect(bonus).toBe(0);
    });

    it("should return bonus for high technical + analysis", () => {
      const synergistic: Traits = {
        technical: 80,
        analysis: 80,
        creativity: 50, social: 50, empathy: 50,
        trading: 50, teaching: 50, leadership: 50,
      };
      
      const bonus = calculateSynergyBonus(synergistic);
      expect(bonus).toBeGreaterThan(0);
    });

    it("should give higher bonus when more synergies are met", () => {
      const oneSynergy: Traits = {
        technical: 80, analysis: 80,
        creativity: 50, social: 50, empathy: 50,
        trading: 50, teaching: 50, leadership: 50,
      };
      
      const multipleSynergies: Traits = {
        technical: 80, analysis: 80,
        creativity: 80, empathy: 80,
        teaching: 80, social: 80,
        trading: 50, leadership: 50,
      };
      
      const bonusOne = calculateSynergyBonus(oneSynergy);
      const bonusMultiple = calculateSynergyBonus(multipleSynergies);
      
      expect(bonusMultiple).toBeGreaterThan(bonusOne);
    });
  });

  describe("calculateTotalFitness", () => {
    it("should combine base fitness and synergy bonus", () => {
      const fitness = calculateTotalFitness(highTraits);
      const baseFitness = calculateFitness(highTraits);
      const synergy = calculateSynergyBonus(highTraits);
      
      expect(fitness).toBe(Math.min(100, baseFitness + synergy));
    });

    it("should cap at 100", () => {
      // Even with max traits and synergies, should not exceed 100
      const maxTraits: Traits = {
        technical: 100, creativity: 100, social: 100, analysis: 100,
        empathy: 100, trading: 100, teaching: 100, leadership: 100,
      };
      
      const fitness = calculateTotalFitness(maxTraits);
      expect(fitness).toBeLessThanOrEqual(100);
    });

    it("should work with custom weights", () => {
      const fitness = calculateTotalFitness(averageTraits, FITNESS_PRESETS.trader);
      expect(fitness).toBeDefined();
      expect(fitness).toBeGreaterThan(0);
    });
  });

  describe("FITNESS_PRESETS", () => {
    it("should have trader preset", () => {
      expect(FITNESS_PRESETS.trader).toBeDefined();
      expect(FITNESS_PRESETS.trader.trading).toBe(2.0);
    });

    it("should have teacher preset", () => {
      expect(FITNESS_PRESETS.teacher).toBeDefined();
      expect(FITNESS_PRESETS.teacher.teaching).toBe(2.0);
    });

    it("should have creative preset", () => {
      expect(FITNESS_PRESETS.creative).toBeDefined();
      expect(FITNESS_PRESETS.creative.creativity).toBe(2.0);
    });

    it("should have leader preset", () => {
      expect(FITNESS_PRESETS.leader).toBeDefined();
      expect(FITNESS_PRESETS.leader.leadership).toBe(2.0);
    });
  });
});
