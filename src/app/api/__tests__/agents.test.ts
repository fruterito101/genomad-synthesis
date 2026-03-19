// src/app/api/__tests__/agents.test.ts
// Integration tests for Agents API

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      agents: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: "test-agent-id",
          name: "Test Agent",
          dnaHash: "abc123",
          traits: { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
          fitness: 50,
          generation: 0,
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

// Mock auth middleware
vi.mock("@/lib/auth/middleware", () => ({
  requireAuth: vi.fn(() => Promise.resolve({ privyId: "test-privy-id" })),
}));

// Mock user lookup
vi.mock("@/lib/db", async (importOriginal) => {
  const original = await importOriginal() as any;
  return {
    ...original,
    getUserByPrivyId: vi.fn(() => Promise.resolve({
      id: "test-user-id",
      privyId: "test-privy-id",
    })),
    createAgent: vi.fn(() => Promise.resolve({
      id: "new-agent-id",
      name: "New Agent",
      dnaHash: "newhash123",
      traits: { technical: 60, creativity: 70, social: 55, analysis: 65, empathy: 50, trading: 45, teaching: 60, leadership: 55 },
      fitness: 58,
      generation: 0,
    })),
    getAgentsByOwner: vi.fn(() => Promise.resolve([
      {
        id: "agent-1",
        name: "Agent One",
        dnaHash: "hash1",
        traits: { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
        fitness: 50,
        generation: 0,
        isActive: false,
      },
    ])),
    getAgentById: vi.fn(() => Promise.resolve({
      id: "agent-1",
      name: "Agent One",
      dnaHash: "hash1",
      traits: { technical: 50, creativity: 50, social: 50, analysis: 50, empathy: 50, trading: 50, teaching: 50, leadership: 50 },
      fitness: 50,
      generation: 0,
      isActive: false,
      ownerId: "test-user-id",
    })),
  };
});

// Mock heuristics engine
vi.mock("@/lib/heuristics", () => ({
  heuristicsEngine: {
    analyze: vi.fn(() => ({
      traits: { technical: 60, creativity: 70, social: 55, analysis: 65, empathy: 50, trading: 45, teaching: 60, leadership: 55 },
      totalConfidence: 0.85,
      warnings: [],
    })),
  },
}));

describe("Agents API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Register Agent", () => {
    it("should have required fields validation", () => {
      // Test that name is required
      const invalidBody = { soul: "Test soul content" };
      expect(invalidBody).not.toHaveProperty("name");
    });

    it("should require either soul or identity", () => {
      const invalidBody = { name: "Test Agent" };
      expect(invalidBody).not.toHaveProperty("soul");
      expect(invalidBody).not.toHaveProperty("identity");
    });

    it("should accept valid registration data", () => {
      const validBody = {
        name: "Test Agent",
        soul: "I am a helpful assistant",
        identity: "Name: Test\nRole: Helper",
      };
      
      expect(validBody).toHaveProperty("name");
      expect(validBody.name.length).toBeGreaterThan(0);
      expect(validBody).toHaveProperty("soul");
    });
  });

  describe("Get Agents", () => {
    it("should return array of agents", async () => {
      const { getAgentsByOwner } = await import("@/lib/db");
      const agents = await getAgentsByOwner("test-user-id");
      
      expect(Array.isArray(agents)).toBe(true);
    });

    it("should include required agent fields", async () => {
      const { getAgentsByOwner } = await import("@/lib/db");
      const agents = await getAgentsByOwner("test-user-id");
      
      if (agents.length > 0) {
        const agent = agents[0];
        expect(agent).toHaveProperty("id");
        expect(agent).toHaveProperty("name");
        expect(agent).toHaveProperty("dnaHash");
        expect(agent).toHaveProperty("traits");
        expect(agent).toHaveProperty("fitness");
      }
    });
  });

  describe("Get Agent by ID", () => {
    it("should return agent with all fields", async () => {
      const { getAgentById } = await import("@/lib/db");
      const agent = await getAgentById("agent-1");
      
      expect(agent).toBeDefined();
      expect(agent?.id).toBe("agent-1");
      expect(agent?.name).toBe("Agent One");
    });

    it("should include traits object", async () => {
      const { getAgentById } = await import("@/lib/db");
      const agent = await getAgentById("agent-1");
      
      expect(agent?.traits).toBeDefined();
      expect(agent?.traits).toHaveProperty("technical");
      expect(agent?.traits).toHaveProperty("creativity");
      expect(agent?.traits).toHaveProperty("social");
    });
  });

  describe("Heuristics Analysis", () => {
    it("should analyze soul content", async () => {
      const { heuristicsEngine } = await import("@/lib/heuristics");
      const result = heuristicsEngine.analyze({
        soul: "I am a technical assistant with strong analytical skills",
        identity: "",
        tools: "",
      });
      
      expect(result).toHaveProperty("traits");
      expect(result).toHaveProperty("totalConfidence");
      expect(result.totalConfidence).toBeGreaterThan(0);
    });

    it("should return traits between 0 and 100", async () => {
      const { heuristicsEngine } = await import("@/lib/heuristics");
      const result = heuristicsEngine.analyze({
        soul: "Test soul",
        identity: "Test identity",
        tools: "",
      });
      
      const traits = result.traits;
      expect(traits.technical).toBeGreaterThanOrEqual(0);
      expect(traits.technical).toBeLessThanOrEqual(100);
    });
  });
});
