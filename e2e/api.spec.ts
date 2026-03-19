import { test, expect } from "@playwright/test";

test.describe("API Health", () => {
  test("GET /api/stats should return stats", async ({ request }) => {
    const response = await request.get("/api/stats");
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty("totalAgents");
    expect(data).toHaveProperty("activeAgents");
  });

  test("GET /api/leaderboard should return leaderboard", async ({ request }) => {
    const response = await request.get("/api/leaderboard");
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.agents || data)).toBeTruthy();
  });

  test("GET /api/zk/prove should return docs", async ({ request }) => {
    const response = await request.get("/api/zk/prove");
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty("proofTypes");
    expect(data.proofTypes).toHaveProperty("breed");
  });

  test("POST /api/agents without auth should fail", async ({ request }) => {
    const response = await request.post("/api/agents", {
      data: { name: "test" },
    });
    // Should return 401 unauthorized
    expect(response.status()).toBe(401);
  });

  test("POST /api/breeding/request without auth should fail", async ({ request }) => {
    const response = await request.post("/api/breeding/request", {
      data: { parentAId: "123", parentBId: "456" },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("Rate Limiting", () => {
  test("should include rate limit headers", async ({ request }) => {
    const response = await request.get("/api/stats");
    
    // Rate limit headers should be present
    const remaining = response.headers()["x-ratelimit-remaining"];
    expect(remaining).toBeDefined();
  });
});
