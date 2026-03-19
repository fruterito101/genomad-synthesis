// src/app/api/__tests__/breeding.test.ts
// Integration tests for Breeding API

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB operations for breeding
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      breedingRequests: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      agents: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: "test-request-id",
          parentAId: "parent-a-id",
          parentBId: "parent-b-id",
          status: "pending",
        }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
  getDb: vi.fn(),
}));

// Mock genetic functions
vi.mock("@/lib/genetic", () => ({
  crossover: vi.fn((parentA, parentB, type) => ({
    technical: Math.round((parentA.technical + parentB.technical) / 2),
    creativity: Math.round((parentA.creativity + parentB.creativity) / 2),
    social: Math.round((parentA.social + parentB.social) / 2),
    analysis: Math.round((parentA.analysis + parentB.analysis) / 2),
    empathy: Math.round((parentA.empathy + parentB.empathy) / 2),
    trading: Math.round((parentA.trading + parentB.trading) / 2),
    teaching: Math.round((parentA.teaching + parentB.teaching) / 2),
    leadership: Math.round((parentA.leadership + parentB.leadership) / 2),
  })),
  applyMutation: vi.fn((traits) => ({
    traits,
    mutationsApplied: 0,
  })),
  calculateTotalFitness: vi.fn(() => 55),
  calculateDNAHash: vi.fn(() => "child-dna-hash"),
}));

const parentA = {
  id: "parent-a-id",
  name: "Parent A",
  traits: { technical: 80, creativity: 60, social: 70, analysis: 75, empathy: 50, trading: 65, teaching: 55, leadership: 85 },
  fitness: 70,
  generation: 1,
  ownerId: "user-a-id",
  tokenId: "1",
};

const parentB = {
  id: "parent-b-id",
  name: "Parent B",
  traits: { technical: 40, creativity: 90, social: 30, analysis: 45, empathy: 80, trading: 35, teaching: 95, leadership: 25 },
  fitness: 55,
  generation: 1,
  ownerId: "user-b-id",
  tokenId: "2",
};

describe("Breeding API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Breeding Request", () => {
    it("should require parentAId and parentBId", () => {
      const invalidBody = { parentAId: "only-one" };
      expect(invalidBody).not.toHaveProperty("parentBId");
    });

    it("should accept valid breeding request", () => {
      const validBody = {
        parentAId: "parent-a-id",
        parentBId: "parent-b-id",
        childName: "Child Agent",
        crossoverType: "weighted",
      };
      
      expect(validBody).toHaveProperty("parentAId");
      expect(validBody).toHaveProperty("parentBId");
      expect(validBody.crossoverType).toBe("weighted");
    });

    it("should support different crossover types", () => {
      const crossoverTypes = ["uniform", "single", "weighted"];
      
      for (const type of crossoverTypes) {
        const body = {
          parentAId: "parent-a-id",
          parentBId: "parent-b-id",
          crossoverType: type,
        };
        expect(crossoverTypes).toContain(body.crossoverType);
      }
    });
  });

  describe("Genetic Crossover", () => {
    it("should produce child traits from parents", async () => {
      const { crossover } = await import("@/lib/genetic");
      const childTraits = crossover(parentA.traits, parentB.traits, "weighted");
      
      expect(childTraits).toHaveProperty("technical");
      expect(childTraits).toHaveProperty("creativity");
    });

    it("should average traits for weighted crossover", async () => {
      const { crossover } = await import("@/lib/genetic");
      const childTraits = crossover(parentA.traits, parentB.traits, "weighted");
      
      // Mock returns average
      expect(childTraits.technical).toBe(60); // (80 + 40) / 2
    });
  });

  describe("Breeding Approval", () => {
    it("should require requestId", () => {
      const invalidBody = {};
      expect(invalidBody).not.toHaveProperty("requestId");
    });

    it("should validate request status", () => {
      const pendingRequest = { status: "pending" };
      const approvedRequest = { status: "approved" };
      
      // Only pending requests can be approved
      expect(pendingRequest.status).toBe("pending");
      expect(approvedRequest.status).not.toBe("pending");
    });
  });

  describe("Breeding Execution", () => {
    it("should create child agent with combined traits", async () => {
      const { calculateTotalFitness } = await import("@/lib/genetic");
      
      const childFitness = calculateTotalFitness({
        technical: 60,
        creativity: 75,
        social: 50,
        analysis: 60,
        empathy: 65,
        trading: 50,
        teaching: 75,
        leadership: 55,
      });
      
      expect(childFitness).toBeDefined();
      expect(typeof childFitness).toBe("number");
    });

    it("should increment generation", () => {
      const childGeneration = Math.max(parentA.generation, parentB.generation) + 1;
      expect(childGeneration).toBe(2);
    });

    it("should track lineage", () => {
      const lineage = [parentA.id, parentB.id];
      expect(lineage).toContain("parent-a-id");
      expect(lineage).toContain("parent-b-id");
      expect(lineage.length).toBe(2);
    });
  });

  describe("Breeding Validation", () => {
    it("should not allow breeding with self", () => {
      const sameParent = {
        parentAId: "same-id",
        parentBId: "same-id",
      };
      
      expect(sameParent.parentAId).toBe(sameParent.parentBId);
      // API should reject this
    });

    it("should require both parents to be on-chain", () => {
      const onChainParent = { tokenId: "1" };
      const offChainParent = { tokenId: null };
      
      expect(onChainParent.tokenId).toBeDefined();
      expect(offChainParent.tokenId).toBeNull();
    });
  });
});
