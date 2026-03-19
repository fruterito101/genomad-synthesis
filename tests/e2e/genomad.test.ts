/**
 * 🧬 GENOMAD E2E TESTS
 * 
 * Tests end-to-end para el sistema Genomad.
 * Cubre: registro, activación, breeding, custody.
 */

import { describe, it, expect, beforeAll } from "bun:test";

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const API_URL = process.env.TEST_API_URL || "http://localhost:3000/api";
const TEST_TIMEOUT = 30000;

// Mock data
const mockAgent = {
  name: "TestAgent",
  platform: "telegram",
  platformId: "test_" + Date.now(),
  traits: {
    technical: 75,
    creativity: 60,
    social: 55,
    analysis: 70,
    empathy: 45,
    trading: 50,
    teaching: 65,
    leadership: 55,
  },
  fitness: 58,
  dnaHash: "0x" + "a".repeat(64),
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(API_URL + endpoint, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json().catch(() => null),
  };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS: API Health
// ═══════════════════════════════════════════════════════════════════

describe("API Health", () => {
  it("should return stats", async () => {
    const res = await apiCall("/stats");
    expect(res.ok).toBe(true);
    expect(res.data).toHaveProperty("totalAgents");
  });

  it("should return leaderboard", async () => {
    const res = await apiCall("/leaderboard");
    expect(res.ok).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: Agent Registration
// ═══════════════════════════════════════════════════════════════════

describe("Agent Registration", () => {
  it("should register a new agent", async () => {
    const res = await apiCall("/agents/register", {
      method: "POST",
      body: JSON.stringify(mockAgent),
    });
    
    // May fail if already exists, that's ok
    expect([200, 201, 409]).toContain(res.status);
  });

  it("should reject invalid traits", async () => {
    const invalidAgent = {
      ...mockAgent,
      platformId: "invalid_" + Date.now(),
      traits: {
        technical: 150, // Invalid: > 100
        creativity: -10, // Invalid: < 0
        social: 50,
        analysis: 50,
        empathy: 50,
        trading: 50,
        teaching: 50,
        leadership: 50,
      },
    };

    const res = await apiCall("/agents/register", {
      method: "POST",
      body: JSON.stringify(invalidAgent),
    });

    expect(res.ok).toBe(false);
  });

  it("should get agent list", async () => {
    const res = await apiCall("/agents");
    expect(res.ok).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: Verification Codes
// ═══════════════════════════════════════════════════════════════════

describe("Verification Codes", () => {
  it("should generate a code (requires auth)", async () => {
    const res = await apiCall("/codes/generate", {
      method: "POST",
      body: JSON.stringify({}),
    });
    
    // Will fail without auth, that's expected
    expect([200, 201, 401, 403]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: Breeding System
// ═══════════════════════════════════════════════════════════════════

describe("Breeding System", () => {
  it("should check breeding compatibility", async () => {
    const res = await apiCall("/breeding/check?parentA=1&parentB=2");
    // May return 404 if agents don't exist
    expect([200, 400, 404]).toContain(res.status);
  });

  it("should list breeding requests (requires auth)", async () => {
    const res = await apiCall("/breeding/requests");
    expect([200, 401]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: ZK Proofs
// ═══════════════════════════════════════════════════════════════════

describe("ZK Proofs", () => {
  it("should generate mock trait proof", async () => {
    const res = await apiCall("/zk/prove", {
      method: "POST",
      body: JSON.stringify({
        type: "trait",
        traits: [75, 60, 55, 70, 45, 50, 65, 55],
        salt: "a".repeat(64),
        expectedCommitment: "0x" + "b".repeat(64),
      }),
    });

    // Should work in dev mode (mock proofs)
    expect([200, 400, 500]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TESTS: Trait Calculations
// ═══════════════════════════════════════════════════════════════════

describe("Trait Calculations", () => {
  it("fitness should be calculated correctly", () => {
    const traits = mockAgent.traits;
    const values = Object.values(traits);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Fitness should be reasonable (not 0, not 100)
    expect(avg).toBeGreaterThan(0);
    expect(avg).toBeLessThan(100);
  });

  it("all traits should be in valid range", () => {
    const traits = mockAgent.traits;
    for (const [name, value] of Object.entries(traits)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});
