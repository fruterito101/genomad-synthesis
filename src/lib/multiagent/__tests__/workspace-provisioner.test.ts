// ═══════════════════════════════════════════════════════════════════
// WORKSPACE PROVISIONER TESTS
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { existsSync, rmSync } from "fs";
import { join } from "path";
import {
  provisionWorkspace,
  deprovisionWorkspace,
  workspaceExists,
  getWorkspaceInfo,
  getAgentWorkspacePath,
} from "../workspace-provisioner";
import type { AgentChild, Traits } from "../types";

// ═══════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════

const TEST_AGENT_ID = "test-agent-workspace-" + Date.now();

const mockTraits: Traits = {
  technical: 75,
  creativity: 65,
  social: 55,
  analysis: 70,
  empathy: 60,
  trading: 50,
  teaching: 45,
  leadership: 40,
};

const mockChild: AgentChild = {
  id: TEST_AGENT_ID,
  name: "TestWorkspaceAgent",
  traits: mockTraits,
  fitness: 58,
  generation: 1,
  parentA: {
    id: "parent-a",
    name: "ParentA",
    traits: mockTraits,
    fitness: 60,
    generation: 0,
  },
  parentB: {
    id: "parent-b",
    name: "ParentB",
    traits: mockTraits,
    fitness: 55,
    generation: 0,
  },
  crossoverMask: [true, true, false, false, true, true, false, false],
  mutations: [0, 0, 0, 0, 0, 0, 0, 0],
};

// ═══════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════

afterAll(() => {
  // Clean up test workspace
  const path = getAgentWorkspacePath(TEST_AGENT_ID);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("getAgentWorkspacePath", () => {
  it("should return path with agent ID", () => {
    const path = getAgentWorkspacePath("my-agent");
    expect(path).toContain("my-agent");
    expect(path).toContain(".openclaw/agents");
  });
});

describe("workspaceExists", () => {
  it("should return false for non-existent workspace", () => {
    const exists = workspaceExists("non-existent-agent-12345");
    expect(exists).toBe(false);
  });
});

describe("provisionWorkspace", () => {
  it("should create workspace structure", () => {
    const result = provisionWorkspace(mockChild, "TestOwner");
    
    expect(result.success).toBe(true);
    expect(result.path).toBeDefined();
    expect(existsSync(result.path)).toBe(true);
  });
  
  it("should create required files", () => {
    const workspacePath = join(getAgentWorkspacePath(TEST_AGENT_ID), "workspace");
    
    expect(existsSync(join(workspacePath, "SOUL.md"))).toBe(true);
    expect(existsSync(join(workspacePath, "IDENTITY.md"))).toBe(true);
    expect(existsSync(join(workspacePath, "AGENTS.md"))).toBe(true);
    expect(existsSync(join(workspacePath, "USER.md"))).toBe(true);
    expect(existsSync(join(workspacePath, "MEMORY.md"))).toBe(true);
    expect(existsSync(join(workspacePath, "HEARTBEAT.md"))).toBe(true);
    expect(existsSync(join(workspacePath, "TOOLS.md"))).toBe(true);
  });
  
  it("should create memory directory", () => {
    const memoryPath = join(getAgentWorkspacePath(TEST_AGENT_ID), "workspace", "memory");
    expect(existsSync(memoryPath)).toBe(true);
  });
  
  it("should fail if workspace already exists", () => {
    const result = provisionWorkspace(mockChild, "TestOwner");
    
    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });
});

describe("getWorkspaceInfo", () => {
  it("should return workspace info", () => {
    const info = getWorkspaceInfo(TEST_AGENT_ID);
    
    expect(info.exists).toBe(true);
    expect(info.files).toBeDefined();
    expect(info.files).toContain("SOUL.md");
  });
  
  it("should return not exists for unknown agent", () => {
    const info = getWorkspaceInfo("unknown-agent-xyz");
    
    expect(info.exists).toBe(false);
  });
});

describe("deprovisionWorkspace", () => {
  it("should remove workspace", () => {
    // First verify it exists
    expect(workspaceExists(TEST_AGENT_ID)).toBe(true);
    
    // Deprovision
    const result = deprovisionWorkspace(TEST_AGENT_ID);
    
    expect(result.success).toBe(true);
    expect(workspaceExists(TEST_AGENT_ID)).toBe(false);
  });
  
  it("should succeed even if workspace does not exist", () => {
    const result = deprovisionWorkspace("non-existent-agent");
    expect(result.success).toBe(true);
  });
});
