// ═══════════════════════════════════════════════════════════════════
// CONFIG MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  readConfig,
  agentExistsInConfig,
} from "../config-manager";

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("readConfig", () => {
  it("should return null or config object", () => {
    const config = readConfig();
    
    // Either null (no config) or an object
    if (config !== null) {
      expect(typeof config).toBe("object");
    }
  });
});

describe("agentExistsInConfig", () => {
  it("should return false for non-existent agent", () => {
    const exists = agentExistsInConfig("definitely-not-real-agent-xyz");
    expect(exists).toBe(false);
  });
});

// Note: Full config manipulation tests would require mocking
// the file system or using a test config file. These are kept
// simple to avoid modifying the actual openclaw.json.
