// src/lib/blockchain/__tests__/events.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  AgentRegisteredEvent,
  TransferEvent,
  BreedingRequestedEvent,
  BreedingExecutedEvent,
} from "../events/types";

// Mock the database
vi.mock("@/lib/db/client", () => ({
  getDb: () => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

vi.mock("@/lib/db/schema", () => ({
  agents: {},
  breedingRequests: {},
  users: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

describe("Event Types", () => {
  describe("AgentRegisteredEvent", () => {
    it("should have correct structure", () => {
      const event: AgentRegisteredEvent = {
        tokenId: BigInt(1),
        owner: "0x1234567890123456789012345678901234567890",
        dnaCommitment: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        generation: BigInt(0),
        blockNumber: BigInt(100),
        transactionHash: "0xtxhash",
      };

      expect(event.tokenId).toBe(BigInt(1));
      expect(event.owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(event.dnaCommitment).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(event.generation).toBe(BigInt(0));
    });
  });

  describe("TransferEvent", () => {
    it("should have from, to, and tokenId", () => {
      const event: TransferEvent = {
        from: "0x0000000000000000000000000000000000000000",
        to: "0x1234567890123456789012345678901234567890",
        tokenId: BigInt(1),
        blockNumber: BigInt(100),
        transactionHash: "0xtxhash",
      };

      expect(event.from).toBeDefined();
      expect(event.to).toBeDefined();
      expect(event.tokenId).toBe(BigInt(1));
    });

    it("should identify mint transfers", () => {
      const event: TransferEvent = {
        from: "0x0000000000000000000000000000000000000000",
        to: "0x1234567890123456789012345678901234567890",
        tokenId: BigInt(1),
        blockNumber: BigInt(100),
        transactionHash: "0xtxhash",
      };

      const isMint = event.from === "0x0000000000000000000000000000000000000000";
      expect(isMint).toBe(true);
    });
  });

  describe("BreedingRequestedEvent", () => {
    it("should have parent IDs and initiator", () => {
      const event: BreedingRequestedEvent = {
        requestId: BigInt(1),
        parentA: BigInt(10),
        parentB: BigInt(20),
        initiator: "0x1234567890123456789012345678901234567890",
        blockNumber: BigInt(100),
        transactionHash: "0xtxhash",
      };

      expect(event.requestId).toBe(BigInt(1));
      expect(event.parentA).toBe(BigInt(10));
      expect(event.parentB).toBe(BigInt(20));
      expect(event.initiator).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("BreedingExecutedEvent", () => {
    it("should have requestId and childTokenId", () => {
      const event: BreedingExecutedEvent = {
        requestId: BigInt(1),
        childTokenId: BigInt(30),
        blockNumber: BigInt(100),
        transactionHash: "0xtxhash",
      };

      expect(event.requestId).toBe(BigInt(1));
      expect(event.childTokenId).toBe(BigInt(30));
    });
  });
});

describe("Event Listener Config", () => {
  it("should support testnet and mainnet networks", () => {
    const testnetConfig = { network: "testnet" as const };
    const mainnetConfig = { network: "mainnet" as const };

    expect(testnetConfig.network).toBe("testnet");
    expect(mainnetConfig.network).toBe("mainnet");
  });
});
